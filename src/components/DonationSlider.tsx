import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { DONATION_TIERS, MIN_DONATION, MAX_DONATION } from "@/lib/constants";

interface Props {
  value: number;
  onChange: (value: number) => void;
  progressPercent: number;
}

const DonationSlider = ({ value, onChange, progressPercent }: Props) => {
  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card">
      {/* Progress bar */}
      <div className="mb-4">
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Amount display */}
      <div className="text-center mb-6">
        <span className="text-4xl font-bold text-primary">{value}€</span>
      </div>

      {/* Slider */}
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={MIN_DONATION}
        max={MAX_DONATION}
        step={1}
        className="mb-4"
      />

      {/* Tier markers */}
      <div className="flex justify-between px-1">
        {DONATION_TIERS.map((tier) => {
          const isActive = value >= tier.amount;
          return (
            <button
              key={tier.amount}
              onClick={() => onChange(tier.amount)}
              className={`text-center transition-all ${isActive ? "text-primary" : "text-muted-foreground"}`}
            >
              <div className={`text-xs font-bold ${isActive ? "text-primary" : ""}`}>{tier.amount}€</div>
              <div className="text-[10px]">{tier.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DonationSlider;
