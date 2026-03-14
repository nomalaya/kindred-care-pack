import { useState, useEffect, useRef, useCallback } from "react";
import { themes, applyTheme, type ThemeDefinition } from "@/lib/themes";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Package, ShieldCheck, ArrowRight, Palette, Download, Loader2, MapPin, Quote, Navigation, Sparkles, Heart } from "lucide-react";
import Logo from "@/components/Logo";
import BeneficiaryAvatar from "@/components/BeneficiaryAvatar";
import DonationAmountSelector from "@/components/DonationAmountSelector";
import ImpactTimeline from "@/components/ImpactTimeline";
import BackButton from "@/components/BackButton";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  TYPOGRAPHY, FONT_SIZES, SPACING_TOKENS, RADIUS, SHADOWS,
  ANIM, CARD_STYLES, BADGE_SIZES, BUTTON_PRESETS, SECTION_HEADER, COLOR_ROLES,
} from "@/lib/designSystem";
import { BADGE_STYLES, getBadgeStyle, getCardBg, DEFAULT_BADGE } from "@/lib/badgeStyles";

const ThemeShowcase = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [donationAmount, setDonationAmount] = useState(36);
  const [animKey, setAnimKey] = useState(0);
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
      const imgW = pageW - 20;
      const imgH = (canvas.height * imgW) / canvas.width;
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      pdf.addImage(imgData, "JPEG", 10, 10, imgW, imgH);
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

      applyTheme(null);
      await wait(300);
      let canvas = await captureCurrentPage();
      let imgW = pageW - 20;
      let imgH = (canvas.height * imgW) / canvas.width;
      pdf.setFontSize(16);
      pdf.text("Thème : Défaut", 10, 10);
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 10, 16, imgW, imgH);

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

      if (savedIndex !== null) applyTheme(themes[savedIndex]);
      else applyTheme(null);
      setActiveIndex(savedIndex);
      pdf.save("tous-les-themes.pdf");
    } finally {
      setIsExporting(false);
    }
  }, [activeIndex]);

  return (
    <div ref={contentRef} className="min-h-screen bg-background text-foreground">
      {/* Sticky palette selector */}
      <div ref={stickyBarRef} className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b py-3 px-4">
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
          <div className="ml-auto flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={exportCurrentTheme} disabled={isExporting}>
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
              PDF actuel
            </Button>
            <Button variant="outline" size="sm" onClick={exportAllThemes} disabled={isExporting}>
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
              Tous les PDFs
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-16">
        <h1 className={SECTION_HEADER.title}>
          Design System — CashForCause
        </h1>

        {/* ===== 1. TYPOGRAPHY ===== */}
        <Section title="Typographie">
          <div className="space-y-4">
            {Object.entries(TYPOGRAPHY).map(([key, cls]) => (
              <div key={key} className="flex items-baseline gap-4">
                <span className="text-xs font-mono text-muted-foreground w-24 shrink-0">{key}</span>
                <span className={cls}>
                  {key.startsWith("h") ? `Titre ${key}` : key === "overline" ? "OVERLINE TEXT" : "Le design au service de la solidarité"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-3 md:grid-cols-5 gap-3">
            {Object.entries(FONT_SIZES).map(([name, size]) => (
              <div key={name} className="text-center">
                <div className="text-xs font-mono text-muted-foreground mb-1">{name}</div>
                <div style={{ fontSize: size }} className="text-foreground font-medium">Aa</div>
                <div className="text-[10px] text-muted-foreground">{size}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ===== 2. SPACING ===== */}
        <Section title="Espacement">
          <div className="space-y-3">
            {Object.entries(SPACING_TOKENS).map(([name, cls]) => (
              <div key={name} className="flex items-center gap-4">
                <span className="text-xs font-mono text-muted-foreground w-40 shrink-0">{name}</span>
                <code className="text-xs bg-muted px-2 py-1 rounded">{cls}</code>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-end gap-1">
            {[1, 2, 3, 4, 6, 8, 10, 12, 16, 20].map((n) => (
              <div key={n} className="flex flex-col items-center">
                <div
                  className="bg-primary/20 border border-primary/30 rounded"
                  style={{ width: `${n * 4}px`, height: `${n * 4}px` }}
                />
                <span className="text-[9px] text-muted-foreground mt-1">{n * 4}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ===== 3. BORDER RADIUS ===== */}
        <Section title="Rayon de bordure">
          <div className="flex flex-wrap gap-4">
            {Object.entries(RADIUS).map(([name, val]) => (
              <div key={name} className="text-center">
                <div
                  className="w-16 h-16 bg-primary/10 border-2 border-primary/30"
                  style={{ borderRadius: val }}
                />
                <div className="text-xs font-mono text-muted-foreground mt-1">{name}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ===== 4. SHADOWS ===== */}
        <Section title="Ombres">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(SHADOWS).map(([name, val]) => (
              <div key={name} className="text-center">
                <div
                  className="w-full h-24 bg-card rounded-2xl border"
                  style={{ boxShadow: val }}
                />
                <div className="text-xs font-mono text-muted-foreground mt-2">{name}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ===== 5. ANIMATIONS ===== */}
        <Section title="Animations (Framer Motion)">
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="sm" onClick={() => setAnimKey((k) => k + 1)}>
              Rejouer les animations
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <motion.div
              key={`fade-${animKey}`}
              {...ANIM.fadeInUp}
              className={CARD_STYLES.inner}
            >
              <p className="text-sm font-medium text-foreground">fadeInUp</p>
              <p className="text-xs text-muted-foreground mt-1">Apparition avec translation</p>
            </motion.div>
            <motion.div
              key={`fadein-${animKey}`}
              {...ANIM.fadeIn}
              className={CARD_STYLES.inner}
            >
              <p className="text-sm font-medium text-foreground">fadeIn</p>
              <p className="text-xs text-muted-foreground mt-1">Fondu simple</p>
            </motion.div>
            <motion.div
              key={`badge-${animKey}`}
              {...ANIM.badgeFadeIn}
              className={CARD_STYLES.inner}
            >
              <p className="text-sm font-medium text-foreground">badgeFadeIn</p>
              <p className="text-xs text-muted-foreground mt-1">Fondu retardé (badges)</p>
            </motion.div>
            <motion.div
              {...ANIM.scaleButton}
              className={`${CARD_STYLES.inner} cursor-pointer`}
            >
              <p className="text-sm font-medium text-foreground">scaleButton</p>
              <p className="text-xs text-muted-foreground mt-1">Hover: scale 1.02</p>
            </motion.div>
          </div>
        </Section>

        {/* ===== 6. SURFACES & COLORS ===== */}
        <Section title="Surfaces, couleurs & rôles">
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
          <div className="mt-6 space-y-1">
            {Object.entries(COLOR_ROLES).map(([key, desc]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-28 shrink-0">{key}</span>
                <span className="text-sm text-foreground">{desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ===== 7. BADGES CONTEXTUELS ===== */}
        <Section title="Badges contextuels (bénéficiaires)">
          <div className="flex flex-wrap gap-2">
            {Object.keys(BADGE_STYLES).map((label) => (
              <Badge
                key={label}
                variant="outline"
                className={`py-1.5 px-3 rounded-2xl text-xs font-semibold ${getBadgeStyle(label)}`}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {label}
              </Badge>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {["Logement provisoire", "Désert médical", "1ère année universitaire", "Aidant familial"].map((b) => (
              <div key={b} className={`rounded-2xl p-4 border ${getCardBg(b)}`}>
                <Badge variant="outline" className={`py-1 px-2 rounded-xl text-[10px] font-semibold ${getBadgeStyle(b)}`}>
                  <Sparkles className="h-2.5 w-2.5 mr-1" />{b}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">Fond de carte associé</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ===== 8. NAVBAR PREVIEW ===== */}
        <Section title="Navigation">
          <div className="bg-card/80 backdrop-blur-md border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-xl font-bold text-foreground">CashForCause</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Causes</span>
              <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">Comment ça marche</span>
              <Button variant="default" size="sm">Se connecter</Button>
              <Button className={BUTTON_PRESETS.cta} size="sm">Je donne</Button>
            </div>
          </div>
        </Section>

        {/* ===== 9. HERO ===== */}
        <Section title="Section Hero">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10 p-10 md:p-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <ShieldCheck className="h-4 w-4" />
                Don transparent & centré sur l'humain
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-4">
                Choisissez qui vous voulez{" "}
                <span className="text-gradient-primary">aider.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl">
                Choisissez une cause, découvrez quelqu'un qui a besoin d'aide, et financez un colis personnalisé.
              </p>
              <div className="flex gap-3">
                <Button className={BUTTON_PRESETS.cta} size="lg">
                  Je donne maintenant <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">Comment ça marche</Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ===== 10. BUTTONS ===== */}
        <Section title="Boutons">
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button className={BUTTON_PRESETS.cta}>CTA — Je donne</Button>
          </div>
          <div className="flex flex-wrap gap-3 items-center mt-4">
            <Button variant="default" size="sm">Small</Button>
            <Button variant="default" size="lg">Large</Button>
            <Button variant="default" disabled>Disabled</Button>
          </div>
        </Section>

        {/* ===== 11. BADGES ===== */}
        <Section title="Badges (shadcn)">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {Object.entries(BADGE_SIZES).map(([name, cls]) => (
              <Badge key={name} className={cls}>Taille {name}</Badge>
            ))}
          </div>
        </Section>

        {/* ===== 12. CARD STYLES ===== */}
        <Section title="Styles de cartes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={CARD_STYLES.page}>
              <p className="text-sm font-medium text-foreground">CARD_STYLES.page</p>
              <p className="text-xs text-muted-foreground mt-1">Cartes principales : bénéficiaire, cause, situation</p>
              <code className="text-[10px] text-muted-foreground mt-2 block">{CARD_STYLES.page}</code>
            </div>
            <div className={CARD_STYLES.inner}>
              <p className="text-sm font-medium text-foreground">CARD_STYLES.inner</p>
              <p className="text-xs text-muted-foreground mt-1">Composants internes : panier, timeline, impact</p>
              <code className="text-[10px] text-muted-foreground mt-2 block">{CARD_STYLES.inner}</code>
            </div>
          </div>
          <div className="mt-4">
            <div className={`${CARD_STYLES.page} ${CARD_STYLES.hover} group cursor-pointer`}>
              <p className={`text-sm font-medium text-foreground ${CARD_STYLES.titleHover}`}>Carte interactive (hover)</p>
              <p className="text-xs text-muted-foreground mt-1">Survolez pour voir l'effet shadow + translation</p>
            </div>
          </div>
        </Section>

        {/* ===== 13. AVATARS ===== */}
        <Section title="Avatars">
          <div className="flex flex-wrap gap-6 items-end">
            {(["sm", "md", "lg"] as const).map((size) => (
              <div key={size} className="text-center">
                <BeneficiaryAvatar name="Samira" gender="woman" ageRange="30-40" hairType="curly" skinTone="medium" size={size} />
                <div className="text-xs text-muted-foreground mt-2">{size}</div>
              </div>
            ))}
            <div className="text-center">
              <BeneficiaryAvatar name="Thomas" gender="man" ageRange="20-30" hairType="straight" skinTone="light" size="lg" />
              <div className="text-xs text-muted-foreground mt-2">man / light / straight</div>
            </div>
            <div className="text-center">
              <BeneficiaryAvatar name="Fatou" gender="woman" ageRange="70-80" hairType="covered" skinTone="dark" size="lg" />
              <div className="text-xs text-muted-foreground mt-2">woman / dark / covered</div>
            </div>
            <div className="text-center">
              <BeneficiaryAvatar name="Marc" gender="man" ageRange="60-70" hairType="bald" skinTone="medium" size="lg" />
              <div className="text-xs text-muted-foreground mt-2">man / bald / elderly</div>
            </div>
          </div>
        </Section>

        {/* ===== 14. BENEFICIARY CARD (reference) ===== */}
        <Section title="Carte bénéficiaire complète (référence)">
          <div className="max-w-md mx-auto">
            <div className={`group rounded-2xl p-8 shadow-card border text-center relative ${CARD_STYLES.hover} ${getCardBg("Logement provisoire")}`}>
              <div className="absolute top-4 left-4">
                <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
              </div>
              <motion.div className="absolute top-4 right-4" {...ANIM.badgeFadeIn}>
                <Badge variant="outline" className={`py-1.5 px-3 rounded-2xl text-xs font-semibold group-hover:brightness-110 transition-all ${getBadgeStyle("Logement provisoire")}`}>
                  <Sparkles className="h-3 w-3 mr-1" />
                  Logement provisoire
                </Badge>
              </motion.div>
              <div className="flex justify-center mb-4 mt-4">
                <BeneficiaryAvatar name="Samira" gender="woman" ageRange="30-40" hairType="curly" skinTone="medium" size="lg" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Samira</h3>
              <p className="text-sm text-muted-foreground/80 mt-0.5">30-39 ans</p>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-0.5 mb-3">
                <MapPin className="h-3 w-3" /> Région Île-de-France
              </div>
              <p className="text-sm text-muted-foreground mb-4">Mère de 3 enfants, en hébergement temporaire depuis 4 mois.</p>
              <div className="flex items-start gap-2 text-sm italic text-primary/80 justify-center mb-6">
                <Quote className="h-4 w-4 mt-0.5 flex-shrink-0" />
                « Un simple colis me redonnerait espoir. »
              </div>
              <Button className="w-full bg-cta hover:bg-cta/90 text-cta-foreground">
                Aider Samira
              </Button>
            </div>
          </div>
        </Section>

        {/* ===== 15. DONATION AMOUNT SELECTOR ===== */}
        <Section title="Sélecteur de montant">
          <div className="max-w-md">
            <DonationAmountSelector value={donationAmount} onChange={setDonationAmount} />
          </div>
        </Section>

        {/* ===== 16. IMPACT TIMELINE ===== */}
        <Section title="Timeline d'impact">
          <div className="max-w-md">
            <ImpactTimeline />
          </div>
        </Section>

        {/* ===== 17. PROGRESS / STEPPER ===== */}
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

        {/* ===== 18. FORMS ===== */}
        <Section title="Formulaires">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="demo-name">Nom complet</Label>
              <Input id="demo-name" placeholder="Jean Dupont" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-email">E-mail</Label>
              <Input id="demo-email" type="email" placeholder="jean@exemple.fr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="demo-disabled">Champ désactivé</Label>
              <Input id="demo-disabled" disabled value="Non modifiable" />
            </div>
            <div className="space-y-2">
              <Label>Sélection</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">Option A</SelectItem>
                  <SelectItem value="b">Option B</SelectItem>
                  <SelectItem value="c">Option C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 col-span-full">
              <Checkbox id="demo-check" />
              <Label htmlFor="demo-check" className="text-sm text-muted-foreground">J'accepte les conditions générales</Label>
            </div>
          </div>
        </Section>

        {/* ===== 19. CAUSE CARDS ===== */}
        <Section title="Cartes de causes">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: "👶", title: "Familles & Enfants", desc: "Soutenir les familles avec enfants en bas âge" },
              { icon: "💜", title: "Santé & Handicap", desc: "Aide aux personnes en situation de handicap" },
              { icon: "🎓", title: "Jeunes & Étudiants", desc: "Accompagner les jeunes en difficulté" },
            ].map((cause) => (
              <div key={cause.title} className={`${CARD_STYLES.page} ${CARD_STYLES.hover} group cursor-pointer`}>
                <div className="text-3xl mb-2">{cause.icon}</div>
                <h3 className={`text-lg font-semibold text-foreground ${CARD_STYLES.titleHover}`}>{cause.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{cause.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ===== 20. EMERGENCY UPSELL ===== */}
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

        {/* ===== 21. BACK BUTTON ===== */}
        <Section title="Bouton retour">
          <div className="flex gap-6">
            <BackButton label="Retour (history)" />
            <BackButton to="/causes" label="Retour aux causes" />
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

export default ThemeShowcase;
