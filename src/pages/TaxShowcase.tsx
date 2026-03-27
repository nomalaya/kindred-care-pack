import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { ANIM, CARD_STYLES, SECTION_HEADER } from "@/lib/designSystem";
import TaxDeductionOptionA from "@/components/TaxDeductionOptionA";
import TaxDeductionOptionB from "@/components/TaxDeductionOptionB";
import TaxDeductionOptionC from "@/components/TaxDeductionOptionC";
import Layout from "@/components/Layout";

const TaxShowcase = () => {
  const [amount, setAmount] = useState(35);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div {...ANIM.fadeInUp} className={SECTION_HEADER.wrapper}>
          <h1 className={SECTION_HEADER.title}>Déduction fiscale — Options visuelles</h1>
          <p className={SECTION_HEADER.subtitle}>
            Comparez 3 options d'affichage en ajustant le montant du don
          </p>
        </motion.div>

        {/* Slider */}
        <div className="bg-card rounded-2xl p-8 border shadow-card mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">Montant du don</span>
            <span className="text-2xl font-bold text-primary">{amount}€</span>
          </div>
          <Slider
            value={[amount]}
            onValueChange={(v) => setAmount(v[0])}
            min={20}
            max={150}
            step={5}
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>20€</span>
            <span>150€</span>
          </div>
        </div>

        {/* Option A */}
        <motion.div {...ANIM.fadeInUp} className={`${CARD_STYLES.inner} mb-8`}>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Option A — Cercles chevauchants
          </h2>
          <TaxDeductionOptionA amount={amount} />
        </motion.div>

        {/* Option B */}
        <motion.div {...ANIM.fadeInUp} className={`${CARD_STYLES.inner} mb-8`}>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Option B — Barre de progression
          </h2>
          <TaxDeductionOptionB amount={amount} />
        </motion.div>

        {/* Option C */}
        <motion.div {...ANIM.fadeInUp} className={`${CARD_STYLES.inner} mb-8`}>
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Option C — Carte avant / après
          </h2>
          <TaxDeductionOptionC amount={amount} />
        </motion.div>
      </div>
    </Layout>
  );
};

export default TaxShowcase;
