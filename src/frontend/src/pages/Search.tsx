import { useNavigate } from "@tanstack/react-router";
import { Crown, Play, Square, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CHAIN_CONFIG } from "../lib/chains";

function randomHex(len: number) {
  return Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");
}

function randomKey() {
  return randomHex(64);
}

interface KeyEntry {
  id: string;
  address: string;
  privateKey: string;
  balance: string;
}

export default function Search() {
  const navigate = useNavigate();
  const [chains, setChains] = useState<string[]>([]);
  const [keys, setKeys] = useState<KeyEntry[]>([]);
  const [running, setRunning] = useState(false);
  const [isVip, setIsVip] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const counterRef = useRef(0);

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

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const start = useCallback(() => {
    if (running) return;
    setRunning(true);

    intervalRef.current = setInterval(() => {
      const newKeys: KeyEntry[] = [];

      for (let i = 0; i < 5; i++) {
        const privateKey = randomKey();
        const address = `0x${randomHex(40)}`;
        counterRef.current += 1;
        const id = `key-${counterRef.current}`;
        newKeys.push({ id, address, privateKey, balance: "[Balance=0]" });
      }

      setKeys((prev) => {
        const next = [...prev, ...newKeys];
        return next.length > 100 ? next.slice(-100) : next;
      });
    }, 50);
  }, [running]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleClear = () => {
    setKeys([]);
    counterRef.current = 0;
  };

  // Unused variable suppression — chains is used in the display below
  void CHAIN_CONFIG;

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

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <button
              type="button"
              onClick={start}
              disabled={running}
              data-ocid="search.start.primary_button"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play size={14} /> Start
            </button>
            <button
              type="button"
              onClick={stop}
              disabled={!running}
              data-ocid="search.stop.secondary_button"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border border-border text-sm font-medium disabled:opacity-30 hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Square size={14} /> Stop
            </button>
            <button
              type="button"
              onClick={handleClear}
              data-ocid="search.clear.secondary_button"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full border border-border text-sm font-medium hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Trash2 size={14} /> Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mb-8 text-sm">
            <span className="text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">
                {keys.length.toLocaleString()}
              </span>{" "}
              keys generated
            </span>
            {chains.length > 0 && (
              <span className="text-muted-foreground">
                Scanning:{" "}
                <span className="text-foreground">
                  {chains.map((c) => c.toUpperCase()).join(", ")}
                </span>
              </span>
            )}
          </div>

          {/* Generated Keys panel — full width */}
          <div className="p-4 sm:p-5 bg-card rounded-2xl border border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">
                Generated Keys
              </h2>
              {running && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
                  </span>
                  Scanning
                </span>
              )}
            </div>
            <div className="relative h-64 sm:h-96 overflow-y-auto">
              {/* Scan line overlay */}
              {running && <div className="scan-line" />}
              {keys.length === 0 ? (
                <div
                  className="flex items-center justify-center h-full"
                  data-ocid="search.keys.empty_state"
                >
                  <p className="text-xs text-muted-foreground">
                    Press Start to begin scanning
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {keys.map((entry, idx) => (
                    <div
                      key={entry.id}
                      className="px-2 py-1.5 border-b border-border/20 last:border-0 hover:bg-accent/40 transition-colors"
                      data-ocid={`search.keys.item.${idx + 1}`}
                    >
                      <div className="text-[10px] font-mono leading-relaxed">
                        <span className="text-muted-foreground/60">
                          EthAddress:{" "}
                        </span>
                        <span className="text-muted-foreground">
                          {entry.address}
                        </span>
                        <span className="text-foreground">-</span>
                        <span className="text-muted-foreground">
                          {entry.balance}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono leading-relaxed">
                        <span className="text-muted-foreground/60">
                          PrivateKey:{" "}
                        </span>
                        <span className="text-muted-foreground/80">
                          {entry.privateKey}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
