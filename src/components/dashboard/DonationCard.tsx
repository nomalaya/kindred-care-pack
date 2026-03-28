import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import { DELIVERY_STATUSES } from "@/lib/constants";
import { generateIndividualReceipt } from "@/lib/generateReceipt";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Beneficiary {
  alias_first_name: string;
  approx_age: number;
  region: string;
  avatar_gender: string;
  avatar_age_range: string;
  avatar_hair_type: string;
  avatar_skin_tone: string;
  avatar_url?: string;
}

interface DonationCardProps {
  id: string;
  amount: number;
  delivery_status: string;
  created_at: string;
  beneficiary: Beneficiary;
  donorName: string;
  donorEmail: string;
}

const STATUS_LABELS: Record<string, (name: string) => string> = {
  confirmed: () => "Don confirmé",
  prepared: () => "Colis en préparation",
  shipped: (name) => `En route vers ${name}`,
  delivered: (name) => `Remis à ${name}`,
};

const DonationCard = ({
  id,
  amount,
  delivery_status,
  created_at,
  beneficiary: b,
  donorName,
  donorEmail,
}: DonationCardProps) => {
  const statusIdx = DELIVERY_STATUSES.findIndex((s) => s.key === delivery_status);
  const statusLabel =
    STATUS_LABELS[delivery_status]?.(b.alias_first_name) || "Don confirmé";

  const handleDownload = () => {
    generateIndividualReceipt(
      {
        id,
        amount,
        created_at,
        beneficiaryName: b.alias_first_name,
        beneficiaryRegion: b.region,
      },
      { name: donorName, email: donorEmail }
    );
  };

  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card">
      <div className="flex items-start gap-4">
        <BeneficiaryAvatar
          name={b.alias_first_name}
          gender={b.avatar_gender}
          ageRange={b.avatar_age_range}
          hairType={b.avatar_hair_type}
          skinTone={b.avatar_skin_tone}
          avatarUrl={b.avatar_url}
          size="sm"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground">
              {b.alias_first_name} – {b.region}
            </h3>
            <span className="text-lg font-bold text-primary">{amount}€</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">
            {new Date(created_at).toLocaleDateString("fr-FR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs font-medium text-primary mb-3">{statusLabel}</p>

          {/* Progress bar */}
          <div className="flex items-center gap-1">
            {DELIVERY_STATUSES.map((s, i) => (
              <div key={s.key} className="flex items-center gap-1 flex-1">
                <div
                  className={`h-1.5 rounded-full flex-1 ${
                    i <= statusIdx ? "bg-primary" : "bg-muted"
                  }`}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {DELIVERY_STATUSES.map((s, i) => (
              <span
                key={s.key}
                className={`text-[10px] ${
                  i <= statusIdx
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                }`}
              >
                {s.icon}
              </span>
            ))}
          </div>

          {/* Download receipt */}
          <div className="mt-3 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-primary gap-1.5 h-7"
              onClick={handleDownload}
            >
              <Download className="h-3.5 w-3.5" />
              Attestation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationCard;
