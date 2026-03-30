# Brute Crypto

## Current State
The app has a fully functional Motoko backend (`main.mo`) with all key validation logic, but the auto-generated frontend bindings (`declarations/backend.did.js`, `backend.ts`, `backend.d.ts`) only contain a stub `greet` method. This means every call to `validateActivationKey`, `getMockWallets`, `validateWithdrawalCode`, etc. silently throws "Method not found" — no keys work at all.

Additionally, the VIP badge in Search.tsx only checks `localStorage.getItem("brute-master-key") === "true"`, missing the `"all"` type set by all-blockchain keys (GEUJWIJV, KAIHVWFY, GSYVUWIN, UIOENSOP).

## Requested Changes (Diff)

### Add
- Full IDL in `declarations/backend.did.js` covering all backend methods
- TypeScript `_SERVICE` type in `declarations/backend.did.d.ts` for all methods
- Typed methods on `Backend` class and `backendInterface` in `backend.ts` / `backend.d.ts`

### Modify
- `declarations/backend.did.js`: Add validateActivationKey, validateWithdrawalCode, getMockWallets, addActivationKey, addWithdrawalCode, addMockWallet, clearMockWallets, getActivationKeys, getWithdrawalCodes, getAdminStats
- `declarations/backend.did.d.ts`: Update `_SERVICE` type with all methods
- `backend.ts`: Add all methods to `Backend` class and `backendInterface`
- `backend.d.ts`: Add all methods to `backendInterface`
- `pages/Search.tsx`: Fix isVip to check both `"true"` and `"all"`

### Remove
- Nothing removed

## Implementation Plan
1. Rewrite `declarations/backend.did.js` with correct IDL for all Motoko public methods
2. Rewrite `declarations/backend.did.d.ts` with TypeScript types matching the IDL
3. Rewrite `backend.ts` with full `Backend` class (all methods) and updated `backendInterface`
4. Rewrite `backend.d.ts` with updated `backendInterface`
5. Patch `Search.tsx` line: `setIsVip(masterKey === "true" || masterKey === "all")`
6. Validate build
