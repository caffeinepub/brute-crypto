import type React from "react";
export interface ChainConfig {
  id: string;
  name: string;
  ticker: string;
  color: string;
  balanceMin: number;
  balanceMax: number;
  decimals: number;
  usdPrice: number;
}

export const CHAIN_CONFIG: ChainConfig[] = [
  {
    id: "btc",
    name: "Bitcoin",
    ticker: "BTC",
    color: "#F7931A",
    balanceMin: 0.001,
    balanceMax: 1.5,
    decimals: 6,
    usdPrice: 65000,
  },
  {
    id: "eth",
    name: "Ethereum",
    ticker: "ETH",
    color: "#627EEA",
    balanceMin: 0.01,
    balanceMax: 10,
    decimals: 6,
    usdPrice: 3500,
  },
  {
    id: "sol",
    name: "Solana",
    ticker: "SOL",
    color: "#9945FF",
    balanceMin: 1,
    balanceMax: 200,
    decimals: 2,
    usdPrice: 155,
  },
  {
    id: "bnb",
    name: "BNB Chain",
    ticker: "BNB",
    color: "#F3BA2F",
    balanceMin: 0.1,
    balanceMax: 20,
    decimals: 2,
    usdPrice: 450,
  },
  {
    id: "doge",
    name: "Dogecoin",
    ticker: "DOGE",
    color: "#C2A633",
    balanceMin: 500,
    balanceMax: 100000,
    decimals: 0,
    usdPrice: 0.15,
  },
  {
    id: "usdt",
    name: "USDT",
    ticker: "USDT",
    color: "#26A17B",
    balanceMin: 100,
    balanceMax: 50000,
    decimals: 2,
    usdPrice: 1,
  },
  {
    id: "trx",
    name: "Tron",
    ticker: "TRX",
    color: "#EF0027",
    balanceMin: 100,
    balanceMax: 50000,
    decimals: 0,
    usdPrice: 0.12,
  },
];

export function getChain(id: string): ChainConfig | undefined {
  return CHAIN_CONFIG.find((c) => c.id === id.toLowerCase());
}

export function randomBalance(chain: ChainConfig): string {
  const val =
    chain.balanceMin + Math.random() * (chain.balanceMax - chain.balanceMin);
  return `${val.toFixed(chain.decimals)} ${chain.ticker}`;
}

export function parseBalanceUSD(balance: string): number {
  const parts = balance.trim().split(" ");
  if (parts.length < 2) return 0;
  const amount = Number.parseFloat(parts[0]);
  const ticker = parts[1].toUpperCase();
  const cfg = CHAIN_CONFIG.find((c) => c.ticker === ticker);
  if (!cfg) return 0;
  return amount * cfg.usdPrice;
}

const LOGO_CDN =
  "https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63530be6e374711a8554f31b17e4cb92c25fa/svg/color";

const CDN_SLUG: Record<string, string> = {
  btc: "btc",
  eth: "eth",
  sol: "sol",
  bnb: "bnb",
  doge: "doge",
  usdt: "usdt",
  trx: "trx",
};

export function ChainLogo({ id, size = 32 }: { id: string; size?: number }) {
  const slug = CDN_SLUG[id.toLowerCase()];
  if (!slug) return null;
  return (
    <img
      src={`${LOGO_CDN}/${slug}.svg`}
      alt={id.toUpperCase()}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        borderRadius: "50%",
      }}
    />
  );
}
