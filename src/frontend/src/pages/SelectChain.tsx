import { useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { CHAIN_CONFIG, ChainLogo } from "../lib/chains";

export default function SelectChain() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [restrictedChains, setRestrictedChains] = useState<string[] | null>(
    null,
  );

  useEffect(() => {
    if (!localStorage.getItem("brute-activation-key")) {
      navigate({ to: "/login" });
      return;
    }
    const masterKey = localStorage.getItem("brute-master-key");
    // 'true' = VIP master key (Brutecryptoadm), 'all' = all-blockchain key
    if (masterKey === "true" || masterKey === "all") {
      setSelected(CHAIN_CONFIG.map((c) => c.id));
      setRestrictedChains(null);
      return;
    }
    const keyChains = localStorage.getItem("brute-key-chains");
    if (keyChains) {
      try {
        const chains = JSON.parse(keyChains);
        setSelected(chains);
        setRestrictedChains(chains);
      } catch {
        // ignore
      }
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
    if (restrictedChains !== null) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const handleStart = () => {
    localStorage.setItem("brute-chains", JSON.stringify(selected));
    navigate({ to: "/search" });
  };

  const getRestrictedChainNames = () => {
    if (!restrictedChains) return "";
    return restrictedChains
      .map((id) => CHAIN_CONFIG.find((c) => c.id === id)?.name ?? id)
      .join(", ");
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
            {restrictedChains
              ? "Your activation key is locked to specific networks."
              : "Choose the networks to scan. Multi-select enabled."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {CHAIN_CONFIG.map((chain, i) => {
              const isSelected = selected.includes(chain.id);
              const isLocked = restrictedChains?.includes(chain.id) ?? false;
              const isDisabled =
                restrictedChains !== null &&
                !restrictedChains.includes(chain.id);

              return (
                <motion.button
                  key={chain.id}
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  onClick={() => !isDisabled && !isLocked && toggle(chain.id)}
                  data-ocid={`chain.${chain.id}.toggle`}
                  disabled={isDisabled}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                    isDisabled
                      ? "opacity-30 cursor-not-allowed border-border bg-card"
                      : isLocked
                        ? "border-foreground bg-card cursor-default"
                        : isSelected
                          ? "border-foreground bg-card hover:scale-[1.02] active:scale-[0.98]"
                          : "border-border bg-card hover:border-muted-foreground hover:scale-[1.02] active:scale-[0.98]"
                  }`}
                >
                  {isLocked && (
                    <div className="absolute top-2 right-2 flex items-center gap-0.5 bg-foreground text-background rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wider">
                      <Lock size={8} />
                      <span>LOCKED</span>
                    </div>
                  )}
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

          {restrictedChains && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center gap-2 mb-8 text-sm text-muted-foreground bg-card border border-border rounded-xl px-4 py-3"
            >
              <Lock size={14} className="shrink-0" />
              <span>
                Your key is restricted to{" "}
                <span className="text-foreground font-medium">
                  {getRestrictedChainNames()}
                </span>{" "}
                only.
              </span>
            </motion.div>
          )}

          {!restrictedChains && <div className="mb-6" />}

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
