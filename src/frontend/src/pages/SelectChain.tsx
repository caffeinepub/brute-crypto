import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { CHAIN_CONFIG, ChainLogo } from "../lib/chains";

export default function SelectChain() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!localStorage.getItem("brute-activation-key")) {
      navigate({ to: "/login" });
      return;
    }
    if (localStorage.getItem("brute-master-key") === "true") {
      setSelected(CHAIN_CONFIG.map((c) => c.id));
      return;
    }
    const stored = localStorage.getItem("brute-chains");
    if (stored) {
      try {
        setSelected(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [navigate]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleStart = () => {
    localStorage.setItem("brute-chains", JSON.stringify(selected));
    navigate({ to: "/search" });
  };

  return (
    <div className="section-padding">
      <div className="container-brute max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            Step 2 of 4
          </p>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground mb-2">
            Select Blockchains
          </h1>
          <p className="text-muted-foreground mb-10">
            Choose the networks to scan. Multi-select enabled.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
            {CHAIN_CONFIG.map((chain, i) => {
              const isSelected = selected.includes(chain.id);
              return (
                <motion.button
                  key={chain.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onClick={() => toggle(chain.id)}
                  data-ocid={`chain.${chain.id}.toggle`}
                  className={`p-5 rounded-2xl border-2 text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    isSelected
                      ? "border-foreground bg-card"
                      : "border-border bg-card hover:border-muted-foreground"
                  }`}
                >
                  <div className="mb-3">
                    <ChainLogo id={chain.id} size={36} />
                  </div>
                  <div className="font-semibold text-sm text-foreground">
                    {chain.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {chain.ticker}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {selected.length === 0
                ? "No chains selected"
                : `${selected.length} chain${
                    selected.length > 1 ? "s" : ""
                  } selected`}
            </p>
            <button
              type="button"
              onClick={handleStart}
              disabled={selected.length === 0}
              data-ocid="chain.start_scan.primary_button"
              className="px-8 py-3.5 rounded-full bg-foreground text-background font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Start Scan
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
