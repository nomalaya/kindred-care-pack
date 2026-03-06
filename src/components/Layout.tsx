import { ReactNode } from "react";
import Navbar from "./Navbar";

const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-16">{children}</main>
    <footer className="bg-card border-t py-12 mt-16">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        <p className="font-semibold text-foreground mb-2">CashForCause</p>
        <p>Making human connection through giving. Every donation tells a story.</p>
        <p className="mt-4">© {new Date().getFullYear()} CashForCause. All rights reserved.</p>
      </div>
    </footer>
  </div>
);

export default Layout;
