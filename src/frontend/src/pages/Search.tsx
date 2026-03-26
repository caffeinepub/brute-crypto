import { useNavigate } from "@tanstack/react-router";
import { Crown, Play, Square } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const rigData = {
  rigId: "RIG-001",
  status: "running",
  uptime: "72h 15m",
  hashRate: { value: 125.6, unit: "MH/s" },
  temperature: [
    { gpu: 0, temp: 65 },
    { gpu: 1, temp: 68 },
    { gpu: 2, temp: 70 },
  ],
  powerUsage: { value: 950, unit: "W" },
  fanSpeed: [
    { gpu: 0, speed: 70 },
    { gpu: 1, speed: 75 },
    { gpu: 2, speed: 80 },
  ],
  earnings: {
    daily: 4.25,
    weekly: 28.75,
    monthly: 120.5,
    currency: "USD",
  },
  wallet: "0xA1b2C3d4E5f6G7h8",
  lastShare: "2026-03-26T10:15:00Z",
};

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

  const truncateWallet = (w: string) =>
    w.length > 18 ? `${w.slice(0, 8)}...${w.slice(-6)}` : w;

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

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Rig Status */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                  Rig Status
                </h2>
                <span className="text-xs font-mono text-muted-foreground">
                  {rigData.rigId}
                </span>
              </div>

              {/* Status + uptime */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm text-foreground">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  {rigData.status.charAt(0).toUpperCase() +
                    rigData.status.slice(1)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Uptime: {rigData.uptime}
                </span>
              </div>

              {/* Hash rate + power */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-background rounded-xl p-3 border border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Hash Rate
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {rigData.hashRate.value}
                    <span className="text-xs font-normal ml-1 text-muted-foreground">
                      {rigData.hashRate.unit}
                    </span>
                  </p>
                </div>
                <div className="bg-background rounded-xl p-3 border border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                    Power
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {rigData.powerUsage.value}
                    <span className="text-xs font-normal ml-1 text-muted-foreground">
                      {rigData.powerUsage.unit}
                    </span>
                  </p>
                </div>
              </div>

              {/* Earnings */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Earnings ({rigData.earnings.currency})
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(["daily", "weekly", "monthly"] as const).map((period) => (
                    <div
                      key={period}
                      className="bg-background rounded-xl p-2.5 border border-border text-center"
                    >
                      <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
                        {period}
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        ${rigData.earnings[period].toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* GPU table */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  GPU Stats
                </p>
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="text-left pb-1 font-normal">GPU</th>
                      <th className="text-left pb-1 font-normal">Temp</th>
                      <th className="text-left pb-1 font-normal">Fan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rigData.temperature.map((t, i) => (
                      <tr key={t.gpu} className="border-t border-border">
                        <td className="py-1 text-muted-foreground">
                          GPU {t.gpu}
                        </td>
                        <td className="py-1 text-foreground">{t.temp}°C</td>
                        <td className="py-1 text-foreground">
                          {rigData.fanSpeed[i].speed}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Wallet + last share */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Wallet
                  </span>
                  <span className="font-mono text-xs text-foreground">
                    {truncateWallet(rigData.wallet)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Last Share
                  </span>
                  <span className="font-mono text-xs text-foreground">
                    {new Date(rigData.lastShare).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Scanner */}
            <div className="flex flex-col gap-4">
              {/* Controls */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                  Scanner Controls
                </p>
                <div className="flex items-center gap-3">
                  {!isRunning ? (
                    <button
                      type="button"
                      onClick={() => setIsRunning(true)}
                      data-ocid="search.primary_button"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-80 active:scale-95 transition-all"
                    >
                      <Play size={14} />
                      Start
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsRunning(false)}
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
                      Running
                    </span>
                  )}
                </div>
              </div>

              {/* Terminal output */}
              <div className="flex-1 bg-card rounded-2xl border border-border p-6 min-h-[300px] flex flex-col">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                  Terminal Output
                </p>
                <div className="flex-1 bg-background rounded-xl border border-border p-4 font-mono text-xs text-muted-foreground">
                  {isRunning ? (
                    <span className="text-foreground">
                      <span className="animate-pulse">&gt; </span>Scanner
                      active...
                    </span>
                  ) : (
                    <span>&gt; Press Start to begin scanning.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
