import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    const body = await req.json();
    const {
      beneficiary_id,
      basket_data,
      emergency_pack_data,
      total_amount,
      donor_name,
      donor_email,
      donor_phone,
      create_account,
    } = body;

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Convert euros to cents for Stripe
    const amountInCents = Math.round(total_amount * 100);

    // Create checkout session in database
    const { data: session, error: sessionError } = await supabaseClient
      .from("checkout_sessions")
      .insert({
        beneficiary_id,
        donor_id: user?.id || null,
        donor_name,
        donor_email,
        donor_phone,
        create_account,
        total_amount,
        basket_data: basket_data || [],
        emergency_pack_data,
        status: "pending",
      })
      .select()
      .single();

    if (sessionError) {
      throw new Error(`Database error: ${sessionError.message}`);
    }

    // Check if customer exists
    let customerId;
    if (donor_email) {
      const customers = await stripe.customers.list({ email: donor_email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      } else {
        // Create new customer
        const customer = await stripe.customers.create({
          email: donor_email,
          name: donor_name,
          phone: donor_phone,
        });
        customerId = customer.id;
      }
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "eur",
      customer: customerId,
      metadata: {
        checkout_session_id: session.id,
        beneficiary_id,
        donor_email,
      },
      description: `Don solidaire pour ${beneficiary_id}`,
    });

    // Update checkout session with payment intent ID
    await supabaseClient
      .from("checkout_sessions")
      .update({
        stripe_payment_intent_id: paymentIntent.id,
      })
      .eq("id", session.id);

    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        session_id: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});