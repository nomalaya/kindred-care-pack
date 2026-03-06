import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Heart, Users, Package, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: Heart, title: "Choose a cause", desc: "Pick a cause close to your heart from 6 categories." },
  { icon: Users, title: "Discover real people", desc: "Meet a real person in need through their story and emotions." },
  { icon: Package, title: "Fund a care package", desc: "Build a personalized basket of essential products." },
];

const stats = [
  { value: "100%", label: "Goes to beneficiaries" },
  { value: "48h", label: "Average delivery time" },
  { value: "6", label: "Causes to support" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cta/5" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <ShieldCheck className="h-4 w-4" />
              Transparent & human-centered giving
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Give to a <span className="text-gradient-primary">real person</span>,
              <br />not just a cause.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Choose a cause, discover someone who needs help, and fund a personalized care package. 
              Feel the connection. See the impact.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/causes">
                <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground text-lg px-8 py-6 shadow-warm-lg">
                  Start helping <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                  How it works
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Three simple steps to change a life</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-sm font-semibold text-primary mb-2">Step {i + 1}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-secondary rounded-3xl p-12 text-center max-w-3xl mx-auto shadow-warm-lg"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to make a difference?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Starting from 32€, you can provide essential items to someone who truly needs them.
            </p>
            <Link to="/causes">
              <Button size="lg" className="bg-cta hover:bg-cta/90 text-cta-foreground text-lg px-8 py-6">
                Choose a cause <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
