import { AnimatePresence, motion } from "framer-motion";
import { Check, Package, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import type { BasketItem } from "@/lib/basketEngine";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  items: BasketItem[];
  amount: number;
  beneficiaryCultureTags?: string[];
  beneficiaryName?: string;
}

// ── Value badges from product.labels[] ──────────────────────
const VALUE_BADGES: Record<string, { label: string; emoji: string; color: string }> = {
  bio: { label: "Bio", emoji: "🌿", color: "border-green-400 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-300" },
  equitable: { label: "Équitable", emoji: "🤝", color: "border-amber-400 text-amber-700 bg-amber-50 dark:bg-amber-950 dark:text-amber-300" },
  made_in_france: { label: "France", emoji: "🇫🇷", color: "border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300" },
  eco: { label: "Éco", emoji: "♻️", color: "border-teal-400 text-teal-700 bg-teal-50 dark:bg-teal-950 dark:text-teal-300" },
};

// ── Cultural region → country mapping ───────────────────────
const CULTURE_REGION_MAP: Record<string, string[]> = {
  maghreb: ["Maroc", "Tunisie", "Algérie"],
  afrique_ouest: ["Sénégal", "Mali", "Côte d'Ivoire", "Guinée", "Cap-Vert", "Togo", "Bénin", "Burkina Faso", "Ghana"],
  afrique_centre: ["Cameroun", "Congo", "RD Congo", "Gabon"],
  afrique_est: ["Comores", "Madagascar", "Maurice"],
  dom: ["Guadeloupe", "Martinique", "Guyane", "Réunion", "Mayotte"],
  portugal: ["Portugal", "Cap-Vert"],
  europe_sud: ["Italie", "Espagne", "Grèce"],
  europe_est: ["Roumanie", "Pologne", "Serbie", "Bulgarie", "Moldavie", "Albanie"],
  turquie: ["Turquie"],
  armenie: ["Arménie", "Géorgie"],
  asie_sud_est: ["Vietnam", "Cambodge", "Laos", "Thaïlande", "Philippines"],
  asie_sud: ["Inde", "Sri Lanka", "Pakistan", "Bangladesh", "Afghanistan"],
  asie_est: ["Chine", "Japon", "Corée du Sud"],
  moyen_orient: ["Liban", "Syrie", "Iran", "Irak", "Égypte", "Palestine", "Jordanie"],
  caraibes: ["Haïti", "Brésil", "Colombie", "Suriname"],
  france: ["France"],
};

function getValueBadges(product: BasketItem["product"]): string[] {
  return (product.labels ?? [])
    .filter((l) => l in VALUE_BADGES)
    .slice(0, 2);
}

function hasCulturalMatch(
  product: BasketItem["product"],
  beneficiaryCultureTags: string[]
): boolean {
  const productOrigins = product.cultural_origin_tags ?? [];
  if (productOrigins.length === 0 || beneficiaryCultureTags.length === 0) return false;

  const expandedCountries = beneficiaryCultureTags.flatMap(
    (tag) => CULTURE_REGION_MAP[tag] ?? [tag]
  );

  return productOrigins.some((origin) =>
    expandedCountries.some((c) => c.toLowerCase() === origin.toLowerCase())
  );
}

const DonationBasket = ({ items, amount, beneficiaryCultureTags = [], beneficiaryName = "" }: Props) => {
  const [flash, setFlash] = useState(false);
  const [prevCount, setPrevCount] = useState(items.length);

  useEffect(() => {
    if (items.length > prevCount) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      setPrevCount(items.length);
      return () => clearTimeout(t);
    }
    setPrevCount(items.length);
  }, [items.length, prevCount]);

  const totalProducts = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <TooltipProvider delayDuration={200}>
      <motion.div
        animate={flash ? { backgroundColor: ["hsl(var(--card))", "hsl(157 68% 33% / 0.05)", "hsl(var(--card))"] } : {}}
        transition={{ duration: 0.6 }}
        className="bg-card rounded-2xl p-6 border shadow-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold text-foreground">Contenu du colis</h3>
        </div>

        <div className="space-y-1.5">
          <AnimatePresence mode="popLayout">
            {items.map((item) => {
              const valueBadges = getValueBadges(item.product);
              const isCulturalMatch = hasCulturalMatch(item.product, beneficiaryCultureTags);
              return (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, scale: 0.8, height: 0 }}
                  animate={{ opacity: 1, scale: 1, height: "auto" }}
                  exit={{ opacity: 0, scale: 0.8, height: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="flex items-center gap-3 py-2 px-3 rounded-lg bg-background"
                >
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground flex-1">
                    {item.product.display_name || item.product.name}
                    {item.quantity > 1 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-1 text-xs font-medium text-primary"
                      >
                        ×{item.quantity}
                      </motion.span>
                    )}
                  </span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {valueBadges.map((badge) => {
                      const config = VALUE_BADGES[badge];
                      if (!config) return null;
                      return (
                        <Tooltip key={badge}>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${config.color}`}>
                              {config.emoji} {config.label}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{config.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                    {isCulturalMatch && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex items-center text-amber-500 cursor-default">
                            <Sparkles className="h-3.5 w-3.5" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Choisi pour {beneficiaryName || "ce bénéficiaire"}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <AnimatePresence mode="wait">
            <motion.span
              key={totalProducts}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="text-sm text-muted-foreground"
            >
              <span className="font-semibold text-foreground">{totalProducts}</span> articles
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.span
              key={amount}
              initial={{ y: -4, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 4, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-xl font-bold text-primary"
            >
              {amount}€
            </motion.span>
          </AnimatePresence>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};

export default DonationBasket;
