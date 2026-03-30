import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@tanstack/react-router";
import {
  Crown,
  Lock,
  LockOpen,
  Play,
  Search as SearchIcon,
  Square,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { backend } from "../lib/backendClient";
import { CHAIN_CONFIG, randomBalance } from "../lib/chains";

// Obfuscated unlock code — do not expose plaintext
const _k = atob("YnJ1dGVjcnlwdG9hZG0=");

interface FoundWallet {
  id: string;
  address: string;
  chain: string;
  balance: string;
  locked: boolean;
  foundAt: number;
}

type SearchLine = { id: number; text: string };

const BTC_PREFIXES = ["bc1q", "1A", "3J"];
const OTHER_PREFIXES = ["TRX", "bnb1", "sol1"];

function generateFakeAddress(chains: string[]): string {
  const chain =
    chains.length > 0
      ? chains[Math.floor(Math.random() * chains.length)]
      : "ETH";
  const chars = "abcdefABCDEF0123456789";
  const rand = (len: number) =>
    Array.from(
      { length: len },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  if (chain === "BTC" || chain === "bitcoin") {
    const prefix =
      BTC_PREFIXES[Math.floor(Math.random() * BTC_PREFIXES.length)];
    return `${prefix}${rand(6)}...${rand(4)}`;
  }
  if (chain === "ETH" || chain === "ethereum") {
    return `0x${rand(6)}...${rand(4)}`;
  }
  const prefix =
    OTHER_PREFIXES[Math.floor(Math.random() * OTHER_PREFIXES.length)];
  return `${prefix}${rand(6)}...${rand(4)}`;
}

function generateWalletForChain(chainIds: string[]): FoundWallet {
  const id =
    chainIds.length > 0
      ? chainIds[Math.floor(Math.random() * chainIds.length)]
      : "eth";
  const cfg =
    CHAIN_CONFIG.find(
      (c) => c.id === id.toLowerCase() || c.ticker === id.toUpperCase(),
    ) ?? CHAIN_CONFIG[1];
  const chars = "abcdefABCDEF0123456789";
  const rand = (len: number) =>
    Array.from(
      { length: len },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  let address: string;
  if (cfg.id === "btc") {
    address = `bc1q${rand(6)}...${rand(4)}`;
  } else if (cfg.id === "trx") {
    address = `T${rand(7)}...${rand(4)}`;
  } else if (cfg.id === "bnb") {
    address = `bnb1${rand(6)}...${rand(4)}`;
  } else if (cfg.id === "sol") {
    address = `sol1${rand(6)}...${rand(4)}`;
  } else {
    address = `0x${rand(6)}...${rand(4)}`;
  }
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    address,
    chain: cfg.ticker,
    balance: randomBalance(cfg),
    locked: true,
    foundAt: Date.now(),
  };
}

function saveWallets(wallets: FoundWallet[]) {
  localStorage.setItem("brute-found-wallets-v2", JSON.stringify(wallets));
  // Mirror to old format for Assets page
  const legacy = wallets.map((w) => ({
    address: w.address,
    chain: w.chain,
    balance: w.balance,
  }));
  localStorage.setItem("brute-found-wallets", JSON.stringify(legacy));
}

let lineIdCounter = 0;

const DISCOVERY_DELAY = 18000000; // exactly 5 hours

function randomDiscoveryDelay() {
  return DISCOVERY_DELAY;
}

export default function Search() {
  const navigate = useNavigate();
  const [chains, setChains] = useState<string[]>([]);
  const [isVip, setIsVip] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [keysScanned, setKeysScanned] = useState(12847392);
  const [searchLines, setSearchLines] = useState<SearchLine[]>([]);
  const [foundWallets, setFoundWallets] = useState<FoundWallet[]>([]);
  const [unlockTarget, setUnlockTarget] = useState<FoundWallet | null>(null);
  const [unlockCode, setUnlockCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [unlockError, setUnlockError] = useState(false);
  const searchScrollRef = useRef<HTMLDivElement>(null);

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

    // Load persisted found wallets from localStorage
    let localWallets: FoundWallet[] = [];
    const savedWallets = localStorage.getItem("brute-found-wallets-v2");
    if (savedWallets) {
      try {
        localWallets = JSON.parse(savedWallets);
      } catch {
        // ignore
      }
    }

    // Merge mock wallets from backend
    backend
      .getMockWallets()
      .then(
        (
          mockWallets: Array<{
            address: string;
            chain: string;
            balance: string;
          }>,
        ) => {
          const existingAddresses = new Set(localWallets.map((w) => w.address));
          const merged = [...localWallets];
          for (const mw of mockWallets) {
            if (!existingAddresses.has(mw.address)) {
              merged.push({
                id: `mock-${mw.address}`,
                address: mw.address,
                chain: mw.chain.toUpperCase(),
                balance: mw.balance,
                locked: true,
                foundAt: Date.now(),
              });
            }
          }
          setFoundWallets(merged);
        },
      )
      .catch(() => {
        setFoundWallets(localWallets);
      });
  }, [navigate]);

  // Handle start — set next discovery time if not already set
  const handleStart = () => {
    setIsRunning(true);
    if (!localStorage.getItem("brute-next-wallet-time")) {
      localStorage.setItem("brute-scan-start", String(Date.now()));
      localStorage.setItem(
        "brute-next-wallet-time",
        String(Date.now() + randomDiscoveryDelay()),
      );
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  // Scan interval: generate search lines, increment counter, check wallet discovery
  useEffect(() => {
    if (!isRunning) return;
    const scrollEl = searchScrollRef;
    const interval = setInterval(() => {
      setKeysScanned((prev) => prev + 500);
      setSearchLines((prev) => {
        const batch: SearchLine[] = Array.from({ length: 6 }, () => ({
          id: ++lineIdCounter,
          text: generateFakeAddress(chains),
        }));
        return [...prev, ...batch].slice(-80);
      });
      setTimeout(() => {
        if (scrollEl.current) {
          scrollEl.current.scrollTop = scrollEl.current.scrollHeight;
        }
      }, 50);

      // Check if it's time to discover a wallet
      const nextTime = Number(localStorage.getItem("brute-next-wallet-time"));
      if (nextTime && Date.now() >= nextTime) {
        const storedChains = localStorage.getItem("brute-chains");
        let chainIds: string[] = ["eth"];
        if (storedChains) {
          try {
            chainIds = JSON.parse(storedChains);
          } catch {
            // ignore
          }
        }
        const newWallet = generateWalletForChain(chainIds);
        setFoundWallets((prev) => {
          const updated = [...prev, newWallet];
          saveWallets(updated);
          return updated;
        });
        localStorage.setItem(
          "brute-next-wallet-time",
          String(Date.now() + randomDiscoveryDelay()),
        );
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isRunning, chains]);

  const handleUnlockSubmit = () => {
    if (!unlockCode.trim() || !unlockTarget) return;
    setVerifying(true);
    setTimeout(() => {
      if (unlockCode.trim().toLowerCase() !== _k) {
        setVerifying(false);
        setUnlockCode("");
        setUnlockError(true);
        return;
      }
      setFoundWallets((prev) => {
        const updated = prev.map((w) =>
          w.id === unlockTarget.id ? { ...w, locked: false } : w,
        );
        saveWallets(updated);
        return updated;
      });
      setVerifying(false);
      setUnlockTarget(null);
      setUnlockCode("");
      setUnlockError(false);
    }, 1500);
  };

  const successRate = `${((foundWallets.length / keysScanned) * 100).toFixed(8)}%`;

  return (
    <div className="section-padding">
      <div className="container-brute">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
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

          {/* Start / Stop */}
          <div className="flex items-center gap-3 mb-8">
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                data-ocid="search.primary_button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-80 active:scale-95 transition-all"
              >
                <Play size={14} />
                Start
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStop}
                data-ocid="search.secondary_button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground text-sm font-semibold hover:bg-background active:scale-95 transition-all"
              >
                <Square size={14} />
                Stop
              </button>
            )}
            {isRunning && (
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                Running &middot; 500 keys / 2s
              </span>
            )}
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Search Box — 2 cols wide */}
            <div
              className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 flex flex-col"
              data-ocid="search.panel"
            >
              <div className="flex items-center gap-2 mb-4">
                <SearchIcon size={14} className="text-muted-foreground" />
                <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                  Search
                </h2>
                {isRunning && (
                  <span className="ml-auto text-[10px] font-mono text-muted-foreground animate-pulse">
                    LIVE
                  </span>
                )}
              </div>

              <div
                ref={searchScrollRef}
                className="flex-1 min-h-[180px] sm:min-h-[260px] max-h-[260px] sm:max-h-[320px] overflow-y-auto rounded-xl bg-background border border-border p-4 font-mono text-[11px] leading-relaxed"
                data-ocid="search.canvas_target"
              >
                {searchLines.length === 0 ? (
                  <p className="text-muted-foreground/50 select-none">
                    Start scanner to begin searching...
                  </p>
                ) : (
                  <AnimatePresence initial={false}>
                    {searchLines.map((line) => (
                      <motion.div
                        key={line.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <span className="text-muted-foreground/40 mr-2 select-none">
                          &rsaquo;
                        </span>
                        <span className="text-foreground/60">Checking:</span>{" "}
                        <span className="text-foreground">{line.text}</span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* Right column: Found Box + Scan Statistics */}
            <div className="flex flex-col gap-6">
              {/* Found Box */}
              <div
                className="bg-card rounded-2xl border border-border p-6"
                data-ocid="search.found.panel"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Wallet size={14} className="text-muted-foreground" />
                  <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                    Found
                  </h2>
                  <span className="ml-auto inline-flex items-center justify-center w-5 h-5 rounded-full bg-foreground text-background text-[10px] font-bold">
                    {foundWallets.length}
                  </span>
                </div>

                {foundWallets.length === 0 ? (
                  <p
                    className="text-muted-foreground/50 text-[11px] text-center py-4"
                    data-ocid="search.found.empty_state"
                  >
                    No wallets found yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {foundWallets.map((w, i) => (
                        <motion.div
                          key={w.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04, duration: 0.25 }}
                          className="rounded-xl bg-background border border-border p-3"
                          data-ocid={`search.found.item.${i + 1}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                              {w.chain}
                            </span>
                            {w.locked ? (
                              <Lock
                                size={12}
                                className="text-muted-foreground"
                              />
                            ) : (
                              <LockOpen size={12} className="text-green-500" />
                            )}
                          </div>
                          <p className="font-mono text-[10px] text-muted-foreground truncate mb-2">
                            {w.address}
                          </p>
                          {w.locked ? (
                            <>
                              <p className="font-mono text-[10px] text-foreground mb-2">
                                {w.balance}
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setUnlockTarget(w);
                                  setUnlockCode("");
                                  setUnlockError(false);
                                }}
                                data-ocid={`search.found.open_modal_button.${i + 1}`}
                                className="text-[10px] font-semibold px-2.5 py-1 rounded-full border border-border hover:bg-foreground hover:text-background transition-all"
                              >
                                Unlock
                              </button>
                            </>
                          ) : (
                            <p className="font-mono text-[10px] text-foreground">
                              {w.balance}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Scan Statistics */}
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                  Scan Statistics
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Keys Scanned
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {keysScanned.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Wallets Found
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {foundWallets.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Success Rate
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      {successRate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Scan Speed
                    </span>
                    <span className="font-mono text-xs text-foreground">
                      500 keys / 2s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Unlock Modal */}
      <Dialog
        open={!!unlockTarget}
        onOpenChange={(open) => {
          if (!open && !verifying) {
            setUnlockTarget(null);
            setUnlockCode("");
            setUnlockError(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" data-ocid="search.unlock.dialog">
          <DialogHeader>
            <DialogTitle className="text-base font-bold tracking-tight">
              Unlock Wallet
            </DialogTitle>
          </DialogHeader>

          {unlockTarget && (
            <div className="space-y-5 pt-1">
              <div className="rounded-xl bg-muted/40 border border-border px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  Wallet Address
                </p>
                <p className="font-mono text-sm text-foreground truncate">
                  {unlockTarget.address}
                </p>
                <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1">
                  {unlockTarget.chain}
                </p>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="unlock-code"
                  className="text-xs font-semibold text-foreground"
                >
                  Enter Unlock Code
                </label>
                <Input
                  id="unlock-code"
                  type="password"
                  data-ocid="search.unlock.input"
                  placeholder="Enter your code..."
                  value={unlockCode}
                  onChange={(e) => {
                    setUnlockCode(e.target.value);
                    setUnlockError(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUnlockSubmit();
                  }}
                  disabled={verifying}
                  className="font-mono"
                />
                {unlockError && (
                  <p className="text-[11px] text-red-500">
                    Invalid code. Try again.
                  </p>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Don&apos;t have a code? Contact{" "}
                <a
                  href="https://t.me/brutecryptoadm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  @brutecryptoadm
                </a>{" "}
                on Telegram to obtain your unlock code.
              </p>

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!verifying) {
                      setUnlockTarget(null);
                      setUnlockCode("");
                      setUnlockError(false);
                    }
                  }}
                  disabled={verifying}
                  data-ocid="search.unlock.cancel_button"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUnlockSubmit}
                  disabled={!unlockCode.trim() || verifying}
                  data-ocid="search.unlock.confirm_button"
                  className="flex-1"
                >
                  {verifying ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Unlock Wallet"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
