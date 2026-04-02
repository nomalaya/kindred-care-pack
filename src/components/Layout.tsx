import { ReactNode } from "react";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-16">{children}</main>
    <footer className="bg-card border-t py-12 mt-16">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        <p className="font-semibold text-foreground mb-2">CashForCause</p>
        <p>Choisissez une personne qui a besoin d'aide et financez l'envoi d'un colis personnalisé. Impact direct et immédiat.</p>
        <div className="mt-4 flex justify-center">
          <SocialIcons variant="subtle" />
        </div>
        <p className="mt-3 text-muted-foreground/60 text-xs">Suivez les histoires et l'impact des dons</p>
        <p className="mt-4">© {new Date().getFullYear()} CashForCause. Tous droits réservés.</p>
      </div>
    </footer>
  </div>
);

export default Layout;
