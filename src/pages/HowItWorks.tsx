// sync
import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Heart,
  ShoppingBag,
  Truck,
  Bell,
  Shield,
  Clock,
  FileCheck,
  ArrowRight,
} from "lucide-react";
import { CARD_STYLES, SECTION_HEADER } from "@/lib/designSystem";

const steps = [
  {
    icon: Heart,
    title: "Vous choisissez une cause, puis une personne",
    short:
      "Choisissez la cause qui vous touche, puis découvrez les profils de personnes qui vivent cette situation. Chaque profil est anonymisé.",
    paragraphs: [
      "Vous commencez par choisir la cause qui vous touche : une famille avec enfants, une femme qui se reconstruit, un étudiant sans ressources, une personne âgée isolée...",
      "Vous découvrez ensuite les situations réelles, puis les profils de personnes qui vivent cette situation. Chaque profil est anonymisé — vous en saurez assez pour ressentir, pas assez pour identifier.",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Vous composez un colis sur mesure",
    short:
      "Les besoins sont identifiés par un travailleur social. En augmentant votre don, les produits s'ajoutent automatiquement à votre colis.",
    paragraphs: [
      "Chaque bénéficiaire a des besoins spécifiques, identifiés par l'assistante sociale ou le travailleur social qui suit son dossier.",
      "En augmentant votre don, des produits s'ajoutent automatiquement à votre colis : alimentation, hygiène, bien-être. Vous voyez exactement ce que vous financez, produit par produit.",
    ],
  },
  {
    icon: Truck,
    title: "Nous nous occupons de tout",
    short:
      "Votre colis est préparé dans nos entrepôts partenaires et part le jour même ou le lendemain. Réception garantie en 24 à 48h.",
    paragraphs: [
      "Dès votre paiement confirmé, votre colis est préparé dans nos entrepôts partenaires à partir de produits issus de nos partenariats avec des distributeurs et des banques alimentaires au niveau national.",
      "Il part le jour même ou le lendemain. La livraison est assurée par un prestataire logistique spécialisé, avec suivi en temps réel. Réception garantie en 24 à 48h.",
    ],
  },
  {
    icon: Bell,
    title: "Vous êtes informé quand le colis arrive",
    short:
      "Vous recevez une notification dès la livraison. Vous savez exactement ce qui s'est passé, quand, et ce que ça a représenté.",
    paragraphs: [
      "Vous recevez une notification dès que votre colis est livré chez son bénéficiaire. Vous savez exactement ce qui s'est passé, quand, et ce que ça a représenté pour cette personne.",
    ],
  },
];

const guarantees = [
  { icon: Shield, label: "Bénéficiaires vérifiés par des travailleurs sociaux" },
  { icon: Clock, label: "Livraison garantie en 24-48h" },
  { icon: FileCheck, label: "Reçu fiscal automatique" },
];

const faq = [
  {
    q: "Comment les bénéficiaires sont-ils sélectionnés ?",
    a: "Aucun bénéficiaire ne peut s'inscrire lui-même sur CashForCause. Chaque profil est constitué à partir d'un dossier validé par un travailleur social ou une assistante sociale d'un organisme public territorial ou d'une association agréée en France. C'est cette rigueur qui garantit que votre aide va là où elle est vraiment nécessaire.",
  },
  {
    q: "L'identité du bénéficiaire est-elle protégée ?",
    a: "Oui, totalement. Les prénoms sont des prénoms d'emprunt, les régions sont approximatives, les photos sont remplacées par des avatars illustrés. Vous ressentez qui est cette personne — vous ne savez pas qui elle est.",
  },
  {
    q: "Puis-je faire confiance à la livraison ?",
    a: "Nos colis sont expédiés depuis des entrepôts logistiques dédiés, par des transporteurs professionnels avec suivi en temps réel. La livraison est garantie en 24 à 48h après votre don.",
  },
  {
    q: "Est-ce que mon don est déductible des impôts ?",
    a: "Oui. DIAFERO est une association habilitée à recevoir des dons ouvrant droit à réduction d'impôt. Vous recevez automatiquement votre reçu fiscal par email après chaque don.",
    link: { to: "/avantage-fiscal", label: "Voir la page Avantage fiscal" },
  },
];

const HowItWorks = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      {/* HERO */}
      <section className={SECTION_HEADER.wrapper}>
        <h1 className={SECTION_HEADER.title}>Comment fonctionne CashForCause ?</h1>
        <p className={SECTION_HEADER.subtitle}>
          Le don habituel est une abstraction. CashForCause est une connexion.
        </p>
        <p className="text-base text-muted-foreground mt-2">
          Voici comment ça fonctionne, étape par étape.
        </p>
      </section>

      {/* 4 ÉTAPES */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {steps.map((step, i) => (
          <div key={step.title} className="bg-card rounded-2xl p-6 shadow-card border">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <step.icon size={32} className="text-primary" />
            </div>
            <div className="text-xs font-semibold text-primary mb-1">Étape {i + 1}</div>
            <h3 className="text-base font-bold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.short}</p>
          </div>
        ))}
      </section>

      {/* DÉTAIL DES ÉTAPES */}
      <section className="space-y-10 mb-16 max-w-3xl mx-auto">
        {steps.map((step, i) => (
          <div key={`detail-${step.title}`} className="flex gap-5 items-start">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <step.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Étape {i + 1} — {step.title}
              </h3>
              <div className="space-y-2">
                {step.paragraphs.map((p) => (
                  <p key={p} className="text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* GARANTIE */}
      <section className="bg-muted/50 rounded-2xl border p-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guarantees.map((g) => (
            <div key={g.label} className="flex items-center gap-3 justify-center text-center md:text-left">
              <g.icon className="h-6 w-6 text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground">{g.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          Vos questions les plus fréquentes
        </h2>
        <div className={CARD_STYLES.inner}>
          <Accordion type="single" collapsible className="w-full">
            {faq.map((item, i) => (
              <AccordionItem key={item.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                  {item.link && (
                    <>
                      {" "}
                      <Link to={item.link.to} className="text-primary font-medium hover:underline">
                        {item.link.label}
                      </Link>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <Link to="/causes">
          <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground text-lg px-8 py-6">
            Trouver quelqu'un à aider <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  </Layout>
);

export default HowItWorks;
