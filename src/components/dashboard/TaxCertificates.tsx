import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Receipt } from "lucide-react";
import { generateIndividualReceipt, generateAnnualReceipt } from "@/lib/generateReceipt";

interface Donation {
  id: string;
  amount: number;
  created_at: string;
  beneficiary: {
    alias_first_name: string;
    region: string;
  };
}

interface TaxCertificatesProps {
  donations: Donation[];
  donorName: string;
  donorEmail: string;
}

const TaxCertificates = ({ donations, donorName, donorEmail }: TaxCertificatesProps) => {
  const years = useMemo(() => {
    const ySet = new Set(donations.map((d) => new Date(d.created_at).getFullYear()));
    return Array.from(ySet).sort((a, b) => b - a);
  }, [donations]);

  const [selectedYear, setSelectedYear] = useState<number>(years[0] || new Date().getFullYear());

  const filtered = useMemo(
    () => donations.filter((d) => new Date(d.created_at).getFullYear() === selectedYear),
    [donations, selectedYear]
  );

  const totalAmount = filtered.reduce((sum, d) => sum + d.amount, 0);
  const taxDeduction = totalAmount * 0.66;
  const realCost = totalAmount * 0.34;

  const donor = { name: donorName, email: donorEmail };

  const handleAnnualDownload = () => {
    generateAnnualReceipt(
      filtered.map((d) => ({
        id: d.id,
        amount: d.amount,
        created_at: d.created_at,
        beneficiaryName: d.beneficiary.alias_first_name,
        beneficiaryRegion: d.beneficiary.region,
      })),
      donor,
      selectedYear
    );
  };

  const handleIndividualDownload = (d: Donation) => {
    generateIndividualReceipt(
      {
        id: d.id,
        amount: d.amount,
        created_at: d.created_at,
        beneficiaryName: d.beneficiary.alias_first_name,
        beneficiaryRegion: d.beneficiary.region,
      },
      donor
    );
  };

  if (donations.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-2xl border">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">Aucune attestation</h2>
        <p className="text-muted-foreground">Vos attestations fiscales apparaîtront ici après votre premier don.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Year selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-foreground">Année :</span>
        <Select
          value={String(selectedYear)}
          onValueChange={(v) => setSelectedYear(Number(v))}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Annual summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="h-5 w-5 text-primary" />
            Récapitulatif {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Nombre de dons</p>
              <p className="text-2xl font-bold text-foreground">{filtered.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total donné</p>
              <p className="text-2xl font-bold text-foreground">{totalAmount.toFixed(0)}€</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Déduction fiscale (66%)</p>
              <p className="text-2xl font-bold text-primary">{taxDeduction.toFixed(0)}€</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Coût réel</p>
              <p className="text-2xl font-bold text-foreground">{realCost.toFixed(0)}€</p>
            </div>
          </div>

          <Button onClick={handleAnnualDownload} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="h-4 w-4 mr-2" />
            Télécharger l'attestation annuelle {selectedYear}
          </Button>
        </CardContent>
      </Card>

      {/* Individual donations */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Détail des dons</h3>
        {filtered.map((d) => (
          <div
            key={d.id}
            className="bg-card rounded-xl p-4 border flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {d.beneficiary.alias_first_name} — {d.beneficiary.region}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(d.created_at).toLocaleDateString("fr-FR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-foreground">{d.amount}€</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 h-8 text-muted-foreground hover:text-primary"
                onClick={() => handleIndividualDownload(d)}
              >
                <Download className="h-3.5 w-3.5" />
                PDF
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxCertificates;
