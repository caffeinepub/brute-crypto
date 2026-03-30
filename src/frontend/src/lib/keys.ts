import { backend } from "./backendClient";

export type KeyResult =
  | { type: "master" }
  | { type: "all" }
  | { type: "chain"; chain: string }
  | { type: "invalid" };

export async function validateKey(input: string): Promise<KeyResult> {
  try {
    const result = await backend.validateActivationKey(input.toUpperCase());
    if (!result.valid || result.alreadyUsed) return { type: "invalid" };
    if (result.chainType === "master") return { type: "master" };
    if (result.chainType === "all") return { type: "all" };
    const chain = result.chainType.toLowerCase();
    if (["btc", "eth", "bnb", "usdt"].includes(chain)) {
      return { type: "chain", chain };
    }
    return { type: "invalid" };
  } catch {
    return { type: "invalid" };
  }
}

export async function validateWithdrawalKey(input: string): Promise<boolean> {
  try {
    const result = await backend.validateWithdrawalCode(input.toUpperCase());
    return result.valid && !result.alreadyUsed;
  } catch {
    return false;
  }
}
