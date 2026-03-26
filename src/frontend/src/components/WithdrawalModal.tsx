import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { CHAIN_CONFIG, ChainLogo } from "../lib/chains";

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

type Step = "wallet-select" | "paypal";

export function WithdrawalModal({
  open,
  onClose,
  wallets,
  wallet: singleWallet,
  bulkCount,
}: WithdrawalModalProps) {
  const [step, setStep] = useState<Step>(
    singleWallet ? "paypal" : "wallet-select",
  );
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(
    singleWallet ?? null,
  );
  const [paypalEmail, setPaypalEmail] = useState("");
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const isBulk = (bulkCount ?? 0) > 1;

  const handleClose = () => {
    setStep(singleWallet ? "paypal" : "wallet-select");
    setSelectedWallet(singleWallet ?? null);
    setPaypalEmail("");
    setProcessing(false);
    setDone(false);
    onClose();
  };

  const handleSelectWallet = (w: WalletItem) => {
    setSelectedWallet(w);
    setStep("paypal");
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

        {/* PayPal Withdrawal */}
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
                  {wallets && (
                    <Button
                      onClick={() => setStep("wallet-select")}
                      variant="ghost"
                      disabled={processing}
                      data-ocid="withdraw.cancel.button"
                    >
                      Back
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
