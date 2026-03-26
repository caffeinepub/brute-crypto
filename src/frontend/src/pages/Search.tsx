import { useNavigate } from "@tanstack/react-router";
import { Crown, Play, Square } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function Search() {
  const navigate = useNavigate();
  const [chains, setChains] = useState<string[]>([]);
  const [isVip, setIsVip] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("brute-activation-key")) {
      navigate({ to: "/login" });
      return;
    }
    setIsVip(localStorage.getItem("brute-master-key") === "true");
    const stored = localStorage.getItem("brute-chains");
    if (stored) {
      try {
        setChains(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [navigate]);

  return (
    <div className="section-padding">
      <div className="container-brute">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
              Dashboard
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Wallet Scanner
              </h1>
              {isVip && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground text-background text-[10px] font-bold tracking-widest uppercase"
                  data-ocid="search.vip.badge"
                >
                  <Crown size={10} />
                  VIP
                </span>
              )}
            </div>
          </div>

          {chains.length > 0 && (
            <div className="mb-6 text-sm text-muted-foreground">
              Scanning:{" "}
              <span className="text-foreground">
                {chains.map((c) => c.toUpperCase()).join(", ")}
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-3 mb-6">
            {!isRunning ? (
              <button
                type="button"
                onClick={() => setIsRunning(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-80 active:scale-95 transition-all"
              >
                <Play size={14} />
                Start
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRunning(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-card active:scale-95 transition-all"
              >
                <Square size={14} />
                Stop
              </button>
            )}
            {isRunning && (
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                Running
              </span>
            )}
          </div>

          <div className="p-6 sm:p-10 bg-card rounded-2xl border border-border flex flex-col items-center justify-center min-h-[300px] text-center">
            <p className="text-sm text-muted-foreground">
              {isRunning
                ? "Scanner is active. Results will appear here when wallets are found."
                : "Press Start to begin scanning."}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
