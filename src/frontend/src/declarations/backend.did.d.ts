/* eslint-disable */

// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

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
export interface _SERVICE {
  greet: ActorMethod<[string], string>;
  addActivationKey: ActorMethod<[string, string, string], boolean>;
  validateActivationKey: ActorMethod<[string], ActivationKeyResult>;
  getActivationKeys: ActorMethod<[string], ActivationKeyInfo[]>;
  addWithdrawalCode: ActorMethod<[string, string], boolean>;
  validateWithdrawalCode: ActorMethod<[string], WithdrawalCodeResult>;
  getWithdrawalCodes: ActorMethod<[string], WithdrawalCodeInfo[]>;
  addMockWallet: ActorMethod<[string, string, string, string], boolean>;
  getMockWallets: ActorMethod<[], MockWallet[]>;
  clearMockWallets: ActorMethod<[string], boolean>;
  getAdminStats: ActorMethod<[string], AdminStats>;
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
