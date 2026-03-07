import { useState, useEffect, useRef, useCallback } from "react";
import { themes, applyTheme, type ThemeDefinition } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, Package, ShieldCheck, ArrowRight, Palette, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const ThemeShowcase = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const stickyBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => applyTheme(null);
  }, []);

  const handleSelect = (index: number | null) => {
    setActiveIndex(index);
    applyTheme(index !== null ? themes[index] : null);
  };

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const captureCurrentPage = async (): Promise<HTMLCanvasElement> => {
    if (stickyBarRef.current) stickyBarRef.current.style.display = "none";
    await wait(100);
    const canvas = await html2canvas(contentRef.current!, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    if (stickyBarRef.current) stickyBarRef.current.style.display = "";
    return canvas;
  };

  const exportCurrentTheme = useCallback(async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await captureCurrentPage();
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg", 0.92);

      let y = 10;
      let remaining = imgH;
      while (remaining > 0) {
        if (y !== 10) pdf.addPage();
        const sliceH = Math.min(remaining, pageH - 20);
        pdf.addImage(imgData, "JPEG", 10, y === 10 ? 10 : 10, imgW, imgH, undefined, "FAST", 0);
        remaining -= sliceH;
        y = 10;
      }

      const name = activeIndex !== null ? themes[activeIndex].name : "defaut";
      pdf.save(`theme-${name.toLowerCase().replace(/\s+/g, "-")}.pdf`);
    } finally {
      setIsExporting(false);
    }
  }, [activeIndex]);

  const exportAllThemes = useCallback(async () => {
    if (!contentRef.current) return;
    setIsExporting(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const savedIndex = activeIndex;

      // Default theme first
      applyTheme(null);
      await wait(300);
      let canvas = await captureCurrentPage();
      let imgW = pageW - 20;
      let imgH = (canvas.height * imgW) / canvas.width;
      pdf.setFontSize(16);
      pdf.text("Thème : Défaut", 10, 10);
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 10, 16, imgW, imgH);

      // Each theme
      for (let i = 0; i < themes.length; i++) {
        pdf.addPage();
        applyTheme(themes[i]);
        await wait(300);
        canvas = await captureCurrentPage();
        imgW = pageW - 20;
        imgH = (canvas.height * imgW) / canvas.width;
        pdf.setFontSize(16);
        pdf.text(`Thème : ${themes[i].name}`, 10, 10);
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 10, 16, imgW, imgH);
      }

      // Restore
      if (savedIndex !== null) applyTheme(themes[savedIndex]);
      else applyTheme(null);
      setActiveIndex(savedIndex);

      pdf.save("tous-les-themes.pdf");
    } finally {
      setIsExporting(false);
    }
  }, [activeIndex]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sticky palette selector */}
      <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b py-3 px-4">
        <div className="container mx-auto flex items-center gap-3 flex-wrap">
          <Palette className="h-5 w-5 text-muted-foreground shrink-0" />
          <button
            onClick={() => handleSelect(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
              activeIndex === null
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:border-foreground/40"
            }`}
          >
            Défaut
          </button>
          {themes.map((theme, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                activeIndex === i
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground/40"
              }`}
            >
              <span className="flex gap-0.5">
                {theme.swatches.map((hex, j) => (
                  <span
                    key={j}
                    className="w-3 h-3 rounded-full inline-block border border-border"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </span>
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-16">
        <h1 className="text-3xl font-bold text-foreground">
          Comparaison des thèmes — CashForCause
        </h1>

        {/* ===== NAVBAR PREVIEW ===== */}
        <Section title="Navigation">
          <div className="bg-card/80 backdrop-blur-md border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-cta fill-cta" />
              <span className="text-xl font-bold text-foreground">CashForCause</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Causes</span>
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Comment ça marche</span>
              <Button variant="default" size="sm">Se connecter</Button>
              <Button className="bg-cta hover:bg-cta/90 text-cta-foreground" size="sm">Je donne</Button>
            </div>
          </div>
        </Section>

        {/* ===== HERO PREVIEW ===== */}
        <Section title="Section Hero">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 p-10 md:p-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <ShieldCheck className="h-4 w-4" />
                Don transparent & centré sur l'humain
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                Choisissez qui vous voulez{" "}
                <span className="text-gradient-primary">aider concrètement.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Choisissez une cause, découvrez quelqu'un qui a besoin d'aide, et financez un colis personnalisé.
              </p>
              <div className="flex gap-3">
                <Button className="bg-cta hover:bg-cta/90 text-cta-foreground" size="lg">
                  Je donne maintenant <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">Comment ça marche</Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ===== CAUSE CARDS ===== */}
        <Section title="Cartes de causes">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "👶", title: "Familles & Enfants", desc: "Soutenir les familles avec enfants en bas âge" },
              { icon: "💜", title: "Santé & Handicap", desc: "Aide aux personnes en situation de handicap" },
              { icon: "🎓", title: "Jeunes & Étudiants", desc: "Accompagner les jeunes en difficulté" },
              { icon: "🤝", title: "Isolement & Précarité", desc: "Lutte contre l'isolement et l'exclusion" },
              { icon: "💼", title: "Réinsertion pro", desc: "Faciliter le retour vers l'emploi" },
              { icon: "🩺", title: "Urgences médicales", desc: "Aide d'urgence en cas de problème de santé" },
            ].map((cause) => (
              <Card key={cause.title} className="hover:shadow-card-hover transition-shadow cursor-pointer group">
                <CardHeader>
                  <div className="text-3xl mb-2">{cause.icon}</div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">{cause.title}</CardTitle>
                  <CardDescription>{cause.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Section>

        {/* ===== SITUATION CARDS ===== */}
        <Section title="Cartes de situations">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: "Parent isolé sans emploi", sentence: "Chaque geste compte pour nourrir ma famille." },
              { title: "Personne âgée en isolement", sentence: "Un colis, c'est un signe que quelqu'un pense à moi." },
              { title: "Jeune sortant de l'ASE", sentence: "J'ai besoin d'un coup de pouce pour démarrer ma vie." },
            ].map((sit) => (
              <Card key={sit.title} className="hover:shadow-card-hover transition-shadow cursor-pointer border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="text-base">{sit.title}</CardTitle>
                  <CardDescription className="italic">« {sit.sentence} »</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Section>

        {/* ===== BENEFICIARY CARDS ===== */}
        <Section title="Cartes bénéficiaires">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Samira", age: 34, region: "Île-de-France", urgency: 4, story: "Mère de 3 enfants, sans emploi depuis 8 mois." },
              { name: "Thomas", age: 22, region: "Lyon", urgency: 2, story: "Étudiant en reconversion, sans famille proche." },
              { name: "Fatou", age: 58, region: "Marseille", urgency: 5, story: "Retraitée avec une petite pension, isolée." },
            ].map((b) => (
              <Card key={b.name} className="hover:shadow-card-hover transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{b.name}, {b.age} ans</CardTitle>
                    <Badge variant={b.urgency >= 4 ? "destructive" : "secondary"} className="text-xs">
                      Urgence {b.urgency}/5
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{b.region}</span>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{b.story}</p>
                  <Button variant="default" size="sm" className="mt-3 w-full">Aider {b.name}</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {/* ===== BUTTONS ===== */}
        <Section title="Boutons">
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button className="bg-cta hover:bg-cta/90 text-cta-foreground">CTA — Je donne</Button>
          </div>
        </Section>

        {/* ===== DONATION SLIDER PREVIEW ===== */}
        <Section title="Sélecteur de montant">
          <SliderPreview />
        </Section>

        {/* ===== PROGRESS / STEPPER ===== */}
        <Section title="Indicateurs de progression">
          <div className="space-y-4 max-w-md">
            <Progress value={33} className="h-2" />
            <Progress value={66} className="h-2" />
            <Progress value={100} className="h-2" />
          </div>
          <div className="flex gap-4 mt-6">
            {["Cause", "Situation", "Bénéficiaire", "Don"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  i <= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className={`text-sm ${i <= 2 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{step}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ===== EMERGENCY UPSELL ===== */}
        <Section title="Pack urgence (upsell)">
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { icon: "🍞", amount: 5, label: "Alimentaire" },
              { icon: "🧴", amount: 8, label: "Hygiène" },
              { icon: "👶", amount: 10, label: "Bébé" },
            ].map((pack, i) => (
              <button
                key={pack.label}
                className={`rounded-xl p-4 border-2 text-center transition-colors ${
                  i === 1
                    ? "border-cta bg-cta/5"
                    : "border-border hover:border-primary/30 bg-background"
                }`}
              >
                <div className="text-2xl mb-2">{pack.icon}</div>
                <div className="text-sm font-semibold text-foreground">{pack.amount}€</div>
                <div className="text-[10px] text-muted-foreground">{pack.label}</div>
              </button>
            ))}
          </div>
        </Section>

        {/* ===== PRODUCT LIST ===== */}
        <Section title="Aperçu produits">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-base">Votre colis solidaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["Riz basmati 1kg", "Huile d'olive 50cl", "Savon de Marseille", "Dentifrice", "Couverture polaire"].map((p) => (
                <div key={p} className="flex items-center justify-between py-1.5 border-b last:border-0">
                  <span className="text-sm text-foreground">{p}</span>
                  <Badge variant="secondary" className="text-xs">×1</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>

        {/* ===== SURFACES & BADGES ===== */}
        <Section title="Surfaces, badges & couleurs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorBlock label="Background" className="bg-background border" />
            <ColorBlock label="Card" className="bg-card border" />
            <ColorBlock label="Muted" className="bg-muted" />
            <ColorBlock label="Accent" className="bg-accent" />
            <ColorBlock label="Primary" className="bg-primary text-primary-foreground" textLight />
            <ColorBlock label="Secondary" className="bg-secondary text-secondary-foreground" textLight />
            <ColorBlock label="CTA" className="bg-cta text-cta-foreground" textLight />
            <ColorBlock label="Destructive" className="bg-destructive text-destructive-foreground" textLight />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Section>
      </div>
    </div>
  );
};

// --- Helper components ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{title}</h2>
      {children}
    </section>
  );
}

function ColorBlock({ label, className, textLight }: { label: string; className: string; textLight?: boolean }) {
  return (
    <div className={`rounded-xl p-6 flex items-center justify-center ${className}`}>
      <span className={`text-sm font-medium ${textLight ? "" : "text-foreground"}`}>{label}</span>
    </div>
  );
}

function SliderPreview() {
  const [val, setVal] = useState([45]);
  return (
    <div className="bg-card rounded-2xl p-6 border shadow-card max-w-md">
      <div className="text-center mb-4">
        <span className="text-4xl font-bold text-primary">{val[0]}€</span>
      </div>
      <Slider value={val} onValueChange={setVal} min={32} max={75} step={1} className="mb-4" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>32€ Essentiel</span>
        <span>45€ Hygiène</span>
        <span>60€ Confort</span>
        <span>75€ Famille+</span>
      </div>
    </div>
  );
}

export default ThemeShowcase;
