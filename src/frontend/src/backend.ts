/* eslint-disable */

// @ts-nocheck

import { Actor, HttpAgent, type HttpAgentOptions, type ActorConfig, type Agent, type ActorSubclass } from "@icp-sdk/core/agent";
import type { Principal } from "@icp-sdk/core/principal";
import { idlFactory, type _SERVICE } from "./declarations/backend.did";

export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

function some<T>(value: T): Some<T> {
    return { __kind__: "Some", value: value };
}
function none(): None {
    return { __kind__: "None" };
}
function isNone<T>(option: Option<T>): option is None {
    return option.__kind__ === "None";
}
function isSome<T>(option: Option<T>): option is Some<T> {
    return option.__kind__ === "Some";
}
function unwrap<T>(option: Option<T>): T {
    if (isNone(option)) throw new Error("unwrap: none");
    return option.value;
}
function candid_some<T>(value: T): [T] {
    return [value];
}
function candid_none<T>(): [] {
    return [];
}
function record_opt_to_undefined<T>(arg: T | null): T | undefined {
    return arg == null ? undefined : arg;
}

export class ExternalBlob {
    _blob?: Uint8Array<ArrayBuffer> | null;
    directURL: string;
    onProgress?: (percentage: number) => void = undefined;
    private constructor(directURL: string, blob: Uint8Array<ArrayBuffer> | null) {
        if (blob) this._blob = blob;
        this.directURL = directURL;
    }
    static fromURL(url: string): ExternalBlob {
        return new ExternalBlob(url, null);
    }
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob {
        const url = URL.createObjectURL(new Blob([new Uint8Array(blob)], { type: 'application/octet-stream' }));
        return new ExternalBlob(url, blob);
    }
    public async getBytes(): Promise<Uint8Array<ArrayBuffer>> {
        if (this._blob) return this._blob;
        const response = await fetch(this.directURL);
        const blob = await response.blob();
        this._blob = new Uint8Array(await blob.arrayBuffer());
        return this._blob;
    }
    public getDirectURL(): string {
        return this.directURL;
    }
    public withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob {
        this.onProgress = onProgress;
        return this;
    }
}

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

export class Backend implements backendInterface {
    constructor(
        private actor: ActorSubclass<_SERVICE>,
        private _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
        private _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
        private processError?: (error: unknown) => never
    ) {}

    private async call<T>(fn: () => Promise<T>): Promise<T> {
        if (this.processError) {
            try {
                return await fn();
            } catch (e) {
                this.processError(e);
                throw new Error("unreachable");
            }
        }
        return fn();
    }

    async greet(arg0: string): Promise<string> {
        return this.call(() => this.actor.greet(arg0));
    }
    async addActivationKey(adminToken: string, key: string, chainType: string): Promise<boolean> {
        return this.call(() => (this.actor as any).addActivationKey(adminToken, key, chainType));
    }
    async validateActivationKey(key: string): Promise<ActivationKeyResult> {
        return this.call(() => (this.actor as any).validateActivationKey(key));
    }
    async getActivationKeys(adminToken: string): Promise<ActivationKeyInfo[]> {
        return this.call(() => (this.actor as any).getActivationKeys(adminToken));
    }
    async addWithdrawalCode(adminToken: string, code: string): Promise<boolean> {
        return this.call(() => (this.actor as any).addWithdrawalCode(adminToken, code));
    }
    async validateWithdrawalCode(code: string): Promise<WithdrawalCodeResult> {
        return this.call(() => (this.actor as any).validateWithdrawalCode(code));
    }
    async getWithdrawalCodes(adminToken: string): Promise<WithdrawalCodeInfo[]> {
        return this.call(() => (this.actor as any).getWithdrawalCodes(adminToken));
    }
    async addMockWallet(adminToken: string, address: string, chain: string, balance: string): Promise<boolean> {
        return this.call(() => (this.actor as any).addMockWallet(adminToken, address, chain, balance));
    }
    async getMockWallets(): Promise<MockWallet[]> {
        return this.call(() => (this.actor as any).getMockWallets());
    }
    async clearMockWallets(adminToken: string): Promise<boolean> {
        return this.call(() => (this.actor as any).clearMockWallets(adminToken));
    }
    async getAdminStats(adminToken: string): Promise<AdminStats> {
        return this.call(() => (this.actor as any).getAdminStats(adminToken));
    }
}

export interface CreateActorOptions {
    agent?: Agent;
    agentOptions?: HttpAgentOptions;
    actorOptions?: ActorConfig;
    processError?: (error: unknown) => never;
}

export function createActor(
    canisterId: string,
    _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    options: CreateActorOptions = {}
): Backend {
    const agent = options.agent || HttpAgent.createSync({ ...options.agentOptions });
    if (options.agent && options.agentOptions) {
        console.warn("Detected both agent and agentOptions passed to createActor. Ignoring agentOptions and proceeding with the provided agent.");
    }
    const actor = Actor.createActor<_SERVICE>(idlFactory, {
        agent,
        canisterId: canisterId,
        ...options.actorOptions
    });
    return new Backend(actor, _uploadFile, _downloadFile, options.processError);
}
