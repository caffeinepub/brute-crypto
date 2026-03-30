# Brute Crypto

## Current State
- 6-page React frontend: Home, Login, SelectChain, Search, Assets, Support
- Keys and withdrawal codes are hardcoded in `lib/keys.ts` (obfuscated)
- PayPal withdrawal shows a processing confirmation screen but doesn't collect email or remove the wallet
- No shared backend state — everything in localStorage per user
- No admin panel

## Requested Changes (Diff)

### Add
- **Motoko backend** to store shared state: activation keys, withdrawal codes, mock wallets
- **Admin panel** at `/admin` route, guarded by secret phrase "The quick brown dog jumps over a lazy fox" (checked frontend-only). Admin can:
  - Add activation keys (key + blockchain type: BTC/ETH/BNB/USDT/ALL)
  - Add withdrawal codes
  - Add mock wallet entries (address, chain, balance)
  - View counts of keys, codes, wallets
- **One-time-use keys**: activation keys and withdrawal codes are marked used in backend after first use; same key can never be used again
- **Global mock wallets**: mock wallets added via admin panel are fetched from backend and shown on Search page found box for all users
- **Updated PayPal flow**: wallet-select → PayPal → enter email → Send button → enter unlock code → confirm → success screen → wallet removed from list

### Modify
- `lib/keys.ts`: remove hardcoded key validation; instead call backend `validateActivationKey` and `validateWithdrawalCode`
- `WithdrawalModal.tsx`: add email-collection step before unlock code for PayPal; add wallet-removal callback on success
- `Assets.tsx`: pass wallet removal handler to WithdrawalModal
- `Search.tsx`: on mount, also load mock wallets from backend (merged with localStorage wallets)
- `App.tsx`: add `/admin` route
- `Login.tsx`: call backend to validate key (one-time use check)

### Remove
- All hardcoded keys/codes from `lib/keys.ts`
- Old synchronous key validation (replaced by async backend calls)

## Implementation Plan
1. Write Motoko backend: `addActivationKey`, `validateActivationKey`, `addWithdrawalCode`, `validateWithdrawalCode`, `addMockWallet`, `getMockWallets`, `getAdminStats` — all admin mutating functions require an admin token parameter
2. Pre-seed backend with existing keys and withdrawal codes via stable storage initialization
3. Create `src/frontend/src/pages/Admin.tsx` — phrase-gated admin panel
4. Update `lib/keys.ts` to export async functions that call backend
5. Update `WithdrawalModal.tsx`: add `paypal-email` step, add `onWalletUsed` prop callback
6. Update `Assets.tsx`: remove wallet from state on successful withdrawal
7. Update `Search.tsx`: fetch mock wallets from backend on mount
8. Register `/admin` route in `App.tsx`
