import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DELIVERY_STATUSES } from "@/lib/constants";
import { toast } from "sonner";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";

const Admin = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([
      supabase.from("donations").select("*, beneficiaries(alias_first_name, region)").order("created_at", { ascending: false }),
      supabase.from("beneficiaries").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("tier").order("name"),
    ]).then(([dRes, bRes, pRes]) => {
      setDonations(dRes.data || []);
      setBeneficiaries(bRes.data || []);
      setProducts(pRes.data || []);
      setLoading(false);
    });
  }, [isAdmin]);

  const updateDeliveryStatus = async (donationId: string, status: string) => {
    const { error } = await supabase
      .from("donations")
      .update({ delivery_status: status } as any)
      .eq("id", donationId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success("Status updated");
      setDonations(prev => prev.map(d => d.id === donationId ? { ...d, delivery_status: status } : d));
    }
  };

  const updateStock = async (productId: string, quantity: number) => {
    const { error } = await supabase
      .from("products")
      .update({ stock_quantity: quantity } as any)
      .eq("id", productId);
    if (error) toast.error("Failed to update stock");
    else {
      toast.success("Stock updated");
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock_quantity: quantity } : p));
    }
  };

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You need administrator privileges to access this page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage beneficiaries, products, and donation statuses.</p>

        <Tabs defaultValue="donations">
          <TabsList className="mb-6">
            <TabsTrigger value="donations">Donations ({donations.length})</TabsTrigger>
            <TabsTrigger value="beneficiaries">Beneficiaries ({beneficiaries.length})</TabsTrigger>
            <TabsTrigger value="products">Products ({products.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="donations">
            {loading ? (
              <div className="animate-pulse bg-card rounded-2xl h-48" />
            ) : (
              <div className="space-y-3">
                {donations.map(d => (
                  <div key={d.id} className="bg-card rounded-xl p-4 border flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {d.beneficiaries?.alias_first_name} – {d.beneficiaries?.region}
                      </p>
                      <p className="text-sm text-muted-foreground">{d.amount}€ · {new Date(d.created_at).toLocaleDateString()}</p>
                    </div>
                    <Select value={d.delivery_status} onValueChange={(v) => updateDeliveryStatus(d.id, v)}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DELIVERY_STATUSES.map(s => (
                          <SelectItem key={s.key} value={s.key}>{s.icon} {s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="beneficiaries">
            {loading ? (
              <div className="animate-pulse bg-card rounded-2xl h-48" />
            ) : (
              <div className="space-y-3">
                {beneficiaries.map(b => (
                  <div key={b.id} className="bg-card rounded-xl p-4 border flex items-center gap-4">
                    <BeneficiaryAvatar
                      name={b.alias_first_name}
                      gender={b.avatar_gender}
                      ageRange={b.avatar_age_range}
                      hairType={b.avatar_hair_type}
                      skinTone={b.avatar_skin_tone}
                      size="sm"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{b.alias_first_name} ({b.real_first_name} {b.real_last_name})</p>
                      <p className="text-sm text-muted-foreground">{b.region} · Age {b.approx_age} · {b.is_active ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="products">
            {loading ? (
              <div className="animate-pulse bg-card rounded-2xl h-48" />
            ) : (
              <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="bg-card rounded-xl p-4 border flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{p.name}</p>
                      <p className="text-sm text-muted-foreground">Tier {p.tier} · {p.category} · {p.price}€</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Stock:</Label>
                      <Input
                        type="number"
                        className="w-20"
                        value={p.stock_quantity}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, stock_quantity: val } : pr));
                        }}
                        onBlur={() => updateStock(p.id, p.stock_quantity)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
