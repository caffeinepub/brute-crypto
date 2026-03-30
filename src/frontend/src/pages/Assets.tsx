import { useNavigate } from "@tanstack/react-router";
import { Coins, Download, TrendingUp, Wallet } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  type WalletItem,
  WithdrawalModal,
} from "../components/WithdrawalModal";
import { CHAIN_CONFIG, ChainLogo, parseBalanceUSD } from "../lib/chains";

interface WalletAsset {
  address: string;
  chain: string;
  balance: string;
}

function fixBalance(balance: string, chainTicker: string): string {
  const parts = balance.trim().split(" ");
  if (
    parts.length === 2 &&
    parts[1].toUpperCase() === chainTicker.toUpperCase()
  ) {
    return balance;
  }
  return `${parts[0]} ${chainTicker}`;
}

function getChainLogoId(ticker: string): string {
  const found = CHAIN_CONFIG.find((c) => c.ticker === ticker);
  return found?.id ?? ticker.toLowerCase();
}

function WalletAnalytics({ assets }: { assets: WalletAsset[] }) {
  if (assets.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const a of assets) {
    counts[a.chain] = (counts[a.chain] ?? 0) + 1;
  }
  const total = assets.length;
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 p-4 sm:p-6 bg-card rounded-2xl border border-border"
    >
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={16} className="text-muted-foreground" />
        <h2 className="text-base font-bold text-foreground">
          Wallet Analytics
        </h2>
      </div>
      <p className="text-xs text-muted-foreground mb-6">
        {total} wallet{total !== 1 ? "s" : ""} found across {entries.length}{" "}
        chain{entries.length !== 1 ? "s" : ""}
      </p>
      <div className="space-y-3">
        <div className="grid grid-cols-[auto_1fr_3rem_3rem] gap-3 items-center text-xs text-muted-foreground uppercase tracking-widest pb-2 border-b border-border">
          <span className="w-5" />
          <span>Chain</span>
          <span className="text-right">Count</span>
          <span className="text-right">Share</span>
        </div>
        {entries.map(([ticker, count]) => {
          const chainId = getChainLogoId(ticker);
          const cfg = CHAIN_CONFIG.find((c) => c.ticker === ticker);
          const pct = Math.round((count / total) * 100);
          return (
            <div key={ticker} className="space-y-1.5">
              <div className="grid grid-cols-[auto_1fr_3rem_3rem] gap-3 items-center">
                <div className="w-5 h-5 flex items-center justify-center">
                  <ChainLogo id={chainId} size={18} />
                </div>
                <span className="text-sm text-foreground font-medium">
                  {cfg?.name ?? ticker}
                  <span className="ml-2 text-xs text-muted-foreground font-normal">
                    {ticker}
                  </span>
                </span>
                <span className="text-sm font-semibold text-foreground text-right tabular-nums">
                  {count}
                </span>
                <span className="text-xs text-muted-foreground text-right tabular-nums">
                  {pct}%
                </span>
              </div>
              <div className="ml-8 h-1 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-foreground/40 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default function Assets() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [filterChain, setFilterChain] = useState("All");
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("brute-activation-key")) {
      navigate({ to: "/login" });
      return;
    }
    const stored = localStorage.getItem("brute-found-wallets");
    if (stored) {
      try {
        const raw = JSON.parse(stored);
        const mapped: WalletAsset[] = raw.map(
          (w: { address: string; chain: string; balance: string }) => ({
            address: w.address,
            chain: w.chain,
            balance: fixBalance(w.balance, w.chain),
          }),
        );
        setAssets(mapped);
      } catch {
        setAssets([]);
      }
    } else {
      setAssets([]);
    }
  }, [navigate]);

  const handleWalletUsed = (wallet: WalletItem) => {
    setAssets((prev) => {
      const updated = prev.filter((a) => a.address !== wallet.address);
      // Sync both localStorage keys
      localStorage.setItem("brute-found-wallets", JSON.stringify(updated));
      // Also update v2 format used by Search page
      const v2stored = localStorage.getItem("brute-found-wallets-v2");
      if (v2stored) {
        try {
          const v2 = JSON.parse(v2stored);
          const updatedV2 = v2.filter(
            (w: { address: string }) => w.address !== wallet.address,
          );
          localStorage.setItem(
            "brute-found-wallets-v2",
            JSON.stringify(updatedV2),
          );
        } catch {
          // ignore
        }
      }
      return updated;
    });
  };

  const chains = ["All", ...Array.from(new Set(assets.map((a) => a.chain)))];
  const filtered =
    filterChain === "All"
      ? assets
      : assets.filter((a) => a.chain === filterChain);

  const totalEarningsUSD = assets.reduce(
    (sum, a) => sum + parseBalanceUSD(a.balance),
    0,
  );

  const handleExport = () => {
    const rows = [
      ["Address", "Chain", "Balance"],
      ...filtered.map((a) => [a.address, a.chain, a.balance]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brute-crypto-assets.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="section-padding">
      <div className="container-brute">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
            Portfolio
          </p>
          <div className="flex items-center gap-2 mb-8 sm:mb-10">
            <Coins size={20} className="text-muted-foreground" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Discovered Assets
            </h1>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-5 sm:p-6 bg-card rounded-2xl border border-border">
              <p className="text-sm text-muted-foreground mb-1">
                Total Wallets Discovered
              </p>
              <p className="text-3xl font-bold text-foreground tabular-nums">
                {assets.length}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Across {chains.length - 1} chains
              </p>
            </div>

            {/* Total Earnings box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="p-5 sm:p-6 bg-card rounded-2xl border border-border"
            >
              <div className="flex items-center gap-2 mb-1">
                <Wallet size={15} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
              <p className="text-3xl font-bold text-foreground tabular-nums">
                $
                {totalEarningsUSD.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Estimated USD value
              </p>
            </motion.div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={filterChain}
                onChange={(e) => setFilterChain(e.target.value)}
                data-ocid="assets.filter.select"
                className="px-4 py-2.5 rounded-xl bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                {chains.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Chains" : c}
                  </option>
                ))}
              </select>

              {/* Primary Withdraw button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setWithdrawOpen(true)}
                disabled={filtered.length === 0}
                data-ocid="assets.withdraw.primary_button"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-semibold disabled:opacity-30 transition-all"
              >
                <Wallet size={14} /> Withdraw
              </motion.button>
            </div>

            <button
              type="button"
              onClick={handleExport}
              disabled={filtered.length === 0}
              data-ocid="assets.export.secondary_button"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-sm font-medium disabled:opacity-30 hover:bg-accent hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>

          {/* Assets table */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-12 text-center" data-ocid="assets.empty_state">
                <p className="text-muted-foreground text-sm">
                  No assets found. Run a scan on the Search page to discover
                  wallets.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[400px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 sm:px-5 py-4 text-xs font-semibold text-muted-foreground">
                        Address
                      </th>
                      <th className="text-left px-4 sm:px-5 py-4 text-xs font-semibold text-muted-foreground">
                        Chain
                      </th>
                      <th className="text-left px-4 sm:px-5 py-4 text-xs font-semibold text-muted-foreground">
                        Balance
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((asset, i) => (
                      <tr
                        key={asset.address}
                        className="border-b border-border/50 last:border-0 hover:bg-accent/50 transition-colors"
                        data-ocid={`assets.item.${i + 1}`}
                      >
                        <td className="px-4 sm:px-5 py-4 font-mono text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
                          {asset.address}
                        </td>
                        <td className="px-4 sm:px-5 py-4">
                          <div className="flex items-center gap-2">
                            <ChainLogo
                              id={getChainLogoId(asset.chain)}
                              size={20}
                            />
                            <span className="text-sm font-medium text-foreground">
                              {asset.chain}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-4 text-sm font-semibold text-foreground tabular-nums whitespace-nowrap">
                          {asset.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Wallet Analytics */}
          <WalletAnalytics assets={assets} />
        </motion.div>
      </div>

      {/* Withdrawal modal with wallet selection */}
      <WithdrawalModal
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        wallets={filtered}
        onWalletUsed={handleWalletUsed}
      />
    </div>
  );
}
