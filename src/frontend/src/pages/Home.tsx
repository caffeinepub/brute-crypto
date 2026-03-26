import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle,
  Globe,
  Key,
  Layers,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "../context/ThemeContext";

const features = [
  {
    icon: Key,
    title: "Seed Phrase Recovery",
    description:
      "Advanced algorithms to recover wallets from partial or corrupted seed phrases with high precision.",
  },
  {
    icon: Shield,
    title: "Password Cracking",
    description:
      "Military-grade brute force and dictionary attacks to unlock encrypted wallet files.",
  },
  {
    icon: Layers,
    title: "Key Derivation",
    description:
      "HD wallet path analysis and key derivation to reconstruct access from any fragment.",
  },
  {
    icon: Globe,
    title: "Multi-Chain Support",
    description:
      "Full support for Bitcoin, Ethereum, Solana, BNB Chain, Polygon, Avalanche, and Tron.",
  },
];

const steps = [
  {
    number: "01",
    title: "Activate",
    description:
      "Enter your activation key to unlock the recovery suite and verify your access.",
  },
  {
    number: "02",
    title: "Select Chains",
    description:
      "Choose which blockchain networks you want to scan for recoverable wallets.",
  },
  {
    number: "03",
    title: "Run Scan",
    description:
      "Our engine generates and tests millions of key combinations across all selected networks.",
  },
  {
    number: "04",
    title: "Export Results",
    description:
      "Download discovered wallets and their balances in CSV format for easy review.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const scrollToHowItWorks = () => {
    document
      .getElementById("how-it-works")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero */}
      <section className="section-padding">
        <div className="container-brute">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-3xl relative"
          >
            {/* Hero glow behind headline */}
            <div
              className="absolute pointer-events-none"
              style={{
                width: 700,
                height: 300,
                top: -60,
                left: -80,
                borderRadius: "50%",
                background: isDark
                  ? "radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, transparent 65%)"
                  : "radial-gradient(ellipse, rgba(0,0,0,0.08) 0%, transparent 65%)",
                filter: "blur(40px)",
                animation: "heroGlow 3.5s ease-in-out infinite",
                zIndex: 0,
              }}
            />

            <div className="relative z-[1]">
              <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-6">
                Premium Crypto Wallet Recovery
              </p>
              <h1 className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4rem] font-bold leading-[1.05] tracking-tight mb-6">
                <span className="gradient-text-sweep">
                  Recover Your Crypto.
                </span>
                <br />
                <span className="text-muted-foreground">
                  Secure Your Future.
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mb-10 leading-relaxed">
                Professional-grade wallet recovery for lost seed phrases,
                forgotten passwords, and corrupted wallet files — across 7 major
                blockchains.
              </p>
              <div className="flex flex-wrap gap-4 mb-12">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/login" })}
                  data-ocid="home.get_started.primary_button"
                  className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-foreground text-background font-semibold text-sm hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Get Started
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-1 transition-transform duration-200"
                  />
                </button>
                <button
                  type="button"
                  onClick={scrollToHowItWorks}
                  data-ocid="home.how_it_works.secondary_button"
                  className="px-7 py-3.5 rounded-full border border-border text-foreground font-semibold text-sm hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  How It Works
                </button>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle size={14} className="shrink-0" />
                <span>
                  Securing wallets since 2018. Trusted by 50,000+ users.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Features */}
      <section className="section-padding">
        <div className="container-brute">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-14"
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
              Capabilities
            </p>
            <h2 className="text-3xl lg:text-[2.25rem] font-bold tracking-tight text-foreground">
              Everything you need to recover access.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className="group p-6 bg-card rounded-2xl border border-border hover:border-foreground/20 hover:shadow-[0_0_28px_rgba(128,128,128,0.1)] transition-all cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background transition-all duration-300">
                  <feature.icon
                    size={18}
                    className="transition-colors duration-300"
                  />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* How It Works */}
      <section id="how-it-works" className="section-padding">
        <div className="container-brute">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mb-14"
          >
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
              Process
            </p>
            <h2 className="text-3xl lg:text-[2.25rem] font-bold tracking-tight text-foreground">
              Four steps to recovery.
            </h2>
          </motion.div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Connector line on desktop */}
            <div className="hidden lg:block absolute top-6 left-[12.5%] w-3/4 h-px bg-border pointer-events-none" />

            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative"
              >
                <p className="text-5xl font-bold text-muted-foreground/30 mb-4 tabular-nums">
                  {step.number}
                </p>
                <h3 className="font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-14 flex justify-start"
          >
            <button
              type="button"
              onClick={() => navigate({ to: "/login" })}
              data-ocid="home.start_recovery.primary_button"
              className="group flex items-center gap-2 px-7 py-3.5 rounded-full bg-foreground text-background font-semibold text-sm hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Start Recovery
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform duration-200"
              />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
