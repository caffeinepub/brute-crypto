import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export interface ActivationKeyResult {
    valid: boolean;
    chainType: string;
    alreadyUsed: boolean;
}
export interface WithdrawalCodeResult {
    valid: boolean;
    alreadyUsed: boolean;
}
export interface ActivationKeyInfo {
    key: string;
    chainType: string;
    used: boolean;
}
export interface WithdrawalCodeInfo {
    code: string;
    used: boolean;
}
export interface MockWallet {
    address: string;
    chain: string;
    balance: string;
}
export interface AdminStats {
    totalKeys: bigint;
    usedKeys: bigint;
    totalCodes: bigint;
    usedCodes: bigint;
    totalWallets: bigint;
}

export interface backendInterface {
    greet(name: string): Promise<string>;
    addActivationKey(adminToken: string, key: string, chainType: string): Promise<boolean>;
    validateActivationKey(key: string): Promise<ActivationKeyResult>;
    getActivationKeys(adminToken: string): Promise<ActivationKeyInfo[]>;
    addWithdrawalCode(adminToken: string, code: string): Promise<boolean>;
    validateWithdrawalCode(code: string): Promise<WithdrawalCodeResult>;
    getWithdrawalCodes(adminToken: string): Promise<WithdrawalCodeInfo[]>;
    addMockWallet(adminToken: string, address: string, chain: string, balance: string): Promise<boolean>;
    getMockWallets(): Promise<MockWallet[]>;
    clearMockWallets(adminToken: string): Promise<boolean>;
    getAdminStats(adminToken: string): Promise<AdminStats>;
}
