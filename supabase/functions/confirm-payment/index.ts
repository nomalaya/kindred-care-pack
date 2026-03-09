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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("Missing stripe-signature header");
    }

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret || "");
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const checkoutSessionId = paymentIntent.metadata.checkout_session_id;
      
      if (!checkoutSessionId) {
        console.log("No checkout session ID found in payment intent metadata");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get checkout session
      const { data: checkoutSession, error: sessionError } = await supabaseClient
        .from("checkout_sessions")
        .select("*")
        .eq("id", checkoutSessionId)
        .single();

      if (sessionError || !checkoutSession) {
        console.error("Checkout session not found:", sessionError);
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update checkout session status
      await supabaseClient
        .from("checkout_sessions")
        .update({
          status: "completed",
          stripe_payment_intent_id: paymentIntent.id,
        })
        .eq("id", checkoutSessionId);

      // Create donation record
      const { error: donationError } = await supabaseClient
        .from("donations")
        .insert({
          donor_id: checkoutSession.donor_id,
          beneficiary_id: checkoutSession.beneficiary_id,
          amount: checkoutSession.total_amount,
          products_sent: checkoutSession.basket_data || [],
          checkout_session_id: checkoutSessionId,
          stripe_payment_id: paymentIntent.id,
          payment_status: "completed",
          delivery_status: "confirmed",
        });

      if (donationError) {
        console.error("Error creating donation:", donationError);
      }

      console.log(`Payment confirmed for checkout session: ${checkoutSessionId}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});