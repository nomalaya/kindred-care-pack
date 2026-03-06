import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Users, Package, Truck, ArrowRight, ShieldCheck, Eye } from "lucide-react";

const steps = [
  { icon: Heart, title: "Pick a cause", desc: "Choose from 6 causes: children, women, students, elderly, workers, health." },
  { icon: Users, title: "Meet someone real", desc: "Discover a real person's story and emotional connection through an anonymous profile." },
  { icon: Package, title: "Build their care package", desc: "Select a donation amount. Products are automatically added based on the person's needs." },
  { icon: Truck, title: "Track the delivery", desc: "Follow the journey from donation to delivery. Get notified when it arrives." },
];

const HowItWorks = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How CashForCause works</h1>
        <p className="text-lg text-muted-foreground">
          We connect you with real people in need, protecting their identity while creating genuine human connection.
        </p>
      </div>

      <div className="space-y-12 mb-16">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-6 items-start">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <step.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-xs font-semibold text-primary mb-1">Step {i + 1}</div>
              <h3 className="text-xl font-semibold text-foreground mb-1">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-2xl p-8 border shadow-card mb-12">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Privacy & Security</h2>
        </div>
        <ul className="space-y-2 text-muted-foreground text-sm">
          <li className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> Real names and addresses are never shown to donors</li>
          <li className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> Avatars are generated to protect identity</li>
          <li className="flex items-start gap-2"><Eye className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" /> Only the association has access to private data</li>
        </ul>
      </div>

      <div className="text-center">
        <Link to="/causes">
          <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground text-lg px-8 py-6">
            Start helping now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  </Layout>
);

export default HowItWorks;
