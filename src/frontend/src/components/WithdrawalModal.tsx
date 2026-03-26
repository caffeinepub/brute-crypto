import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronRight, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { CHAIN_CONFIG, ChainLogo } from "../lib/chains";

const BIP39_WORDS = [
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
  "act",
  "action",
  "actor",
  "actual",
  "adapt",
  "admit",
  "adult",
  "advance",
  "advice",
  "affair",
  "afford",
  "afraid",
  "again",
  "agent",
  "agree",
  "ahead",
  "aim",
  "air",
  "airport",
  "aisle",
  "alarm",
  "album",
  "alcohol",
  "alert",
  "alien",
  "alley",
  "allow",
  "almost",
  "alone",
  "alpha",
  "already",
  "also",
  "alter",
  "always",
  "amateur",
  "amazing",
  "among",
];

function generateSeedPhrase(): string[] {
  return Array.from(
    { length: 12 },
    () => BIP39_WORDS[Math.floor(Math.random() * BIP39_WORDS.length)],
  );
}

function getChainLogoId(ticker: string): string {
  const found = CHAIN_CONFIG.find((c) => c.ticker === ticker);
  return found?.id ?? ticker.toLowerCase();
}

interface WalletItem {
  address: string;
  chain: string;
  balance: string;
}

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
  /** Pass list of wallets for selection flow */
  wallets?: WalletItem[];
  /** Or pass a single wallet directly (skips selection) */
  wallet?: WalletItem | null;
  bulkCount?: number;
}

type Step = "wallet-select" | "method-select" | "seed" | "paypal";

export function WithdrawalModal({
  open,
  onClose,
  wallets,
  wallet: singleWallet,
  bulkCount,
}: WithdrawalModalProps) {
  const [step, setStep] = useState<Step>(
    singleWallet ? "method-select" : "wallet-select",
  );
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(
    singleWallet ?? null,
  );
  const [seedPhrase] = useState<string[]>(generateSeedPhrase);
  const [copied, setCopied] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const isBulk = (bulkCount ?? 0) > 1;

  const handleClose = () => {
    setStep(singleWallet ? "method-select" : "wallet-select");
    setSelectedWallet(singleWallet ?? null);
    setCopied(false);
    setPaypalEmail("");
    setProcessing(false);
    setDone(false);
    onClose();
  };

  const handleSelectWallet = (w: WalletItem) => {
    setSelectedWallet(w);
    setStep("method-select");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(seedPhrase.join(" "));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaypalWithdraw = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
    }, 2000);
  };

  const activeWallet = selectedWallet;

  const title =
    step === "wallet-select"
      ? "Select Wallet to Withdraw"
      : isBulk
        ? `Withdraw ${bulkCount} Wallets`
        : `Withdraw — ${activeWallet?.chain} Wallet`;

  const subtitle =
    step !== "wallet-select" && !isBulk ? activeWallet?.address : undefined;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-lg w-[calc(100vw-2rem)] sm:w-full"
        data-ocid="withdraw.dialog"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground font-mono mt-1 truncate">
              {subtitle}
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

        {/* Step 2: Method selection */}
        {step === "method-select" && (
          <div className="grid grid-cols-1 gap-3 pt-2">
            {!isBulk && (
              <button
                type="button"
                onClick={() => setStep("seed")}
                data-ocid="withdraw.seed.button"
                className="group p-5 rounded-2xl border-2 border-border hover:border-foreground text-left transition-all hover:bg-accent"
              >
                <div className="text-2xl mb-2">🔑</div>
                <div className="font-semibold text-foreground text-sm">
                  Reveal Seed Phrase
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  View the 12-word recovery seed for this wallet.
                </div>
              </button>
            )}

            <button
              type="button"
              onClick={() => setStep("paypal")}
              data-ocid="withdraw.paypal.button"
              className="group p-5 rounded-2xl border-2 border-border hover:border-foreground text-left transition-all hover:bg-accent"
            >
              <div className="text-2xl mb-2">💸</div>
              <div className="font-semibold text-foreground text-sm">
                Withdraw via PayPal
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isBulk
                  ? `Send balance from ${bulkCount} wallets to your PayPal account.`
                  : `Send balance (${activeWallet?.balance}) to your PayPal account.`}
              </div>
            </button>

            {wallets && (
              <button
                type="button"
                onClick={() => setStep("wallet-select")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-1"
              >
                ← Choose a different wallet
              </button>
            )}
          </div>
        )}

        {/* Step 3a: Seed Phrase */}
        {step === "seed" && (
          <div className="pt-2">
            <p className="text-sm text-muted-foreground mb-4">
              Keep this seed phrase secure. Anyone with access can control the
              wallet.
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {seedPhrase.map((word, i) => (
                <div
                  key={`word-${i + 1}`}
                  className="flex items-center gap-2 px-3 py-2.5 bg-accent rounded-xl"
                >
                  <span className="text-xs text-muted-foreground w-5 shrink-0">
                    {i + 1}.
                  </span>
                  <span className="text-sm font-mono font-medium text-foreground">
                    {word}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1"
                data-ocid="withdraw.copy.button"
              >
                {copied ? (
                  <>
                    <Check size={14} className="mr-2" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-2" /> Copy Seed Phrase
                  </>
                )}
              </Button>
              <Button
                onClick={() => setStep("method-select")}
                variant="ghost"
                data-ocid="withdraw.back.button"
              >
                Back
              </Button>
            </div>
          </div>
        )}

        {/* Step 3b: PayPal */}
        {step === "paypal" && (
          <div className="pt-2">
            {done ? (
              <div
                className="flex flex-col items-center text-center py-6"
                data-ocid="withdraw.success_state"
              >
                <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-4">
                  <Check size={28} className="text-foreground" />
                </div>
                <h3 className="font-bold text-foreground mb-1">
                  Withdrawal Initiated!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Funds will arrive within 24–48 hours.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {isBulk ? (
                    `Enter your PayPal email to receive funds from ${bulkCount} selected wallets.`
                  ) : (
                    <>
                      Enter your PayPal email to receive{" "}
                      <span className="text-foreground font-medium">
                        {activeWallet?.balance}
                      </span>
                      .
                    </>
                  )}
                </p>
                <div className="space-y-3 mb-4">
                  <Label htmlFor="paypal-email">PayPal Email</Label>
                  <Input
                    id="paypal-email"
                    type="email"
                    placeholder="you@example.com"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    data-ocid="withdraw.paypal.input"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePaypalWithdraw}
                    disabled={!paypalEmail || processing}
                    className="flex-1"
                    data-ocid="withdraw.paypal.submit_button"
                  >
                    {processing ? (
                      <>
                        <Loader2 size={14} className="mr-2 animate-spin" />{" "}
                        Processing...
                      </>
                    ) : (
                      "Withdraw"
                    )}
                  </Button>
                  <Button
                    onClick={() => setStep("method-select")}
                    variant="ghost"
                    disabled={processing}
                    data-ocid="withdraw.cancel.button"
                  >
                    Back
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
