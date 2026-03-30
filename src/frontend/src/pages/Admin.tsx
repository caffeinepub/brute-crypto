import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Shield,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { adminToken, backend } from "../lib/backendClient";

// Secret phrase stored encoded
const _p = atob("VGhlIHF1aWNrIGJyb3duIGRvZyBqdW1wcyBvdmVyIGEgbGF6eSBmb3g=");

interface KeyRecord {
  key: string;
  chainType: string;
  used: boolean;
}

interface CodeRecord {
  code: string;
  used: boolean;
}

interface MockWallet {
  address: string;
  chain: string;
  balance: string;
}

interface AdminStats {
  totalKeys: number;
  usedKeys: number;
  totalCodes: number;
  usedCodes: number;
  totalWallets: number;
}

export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [phraseError, setPhraseError] = useState("");

  // Admin data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [codes, setCodes] = useState<CodeRecord[]>([]);
  const [mockWallets, setMockWallets] = useState<MockWallet[]>([]);
  const [loading, setLoading] = useState(false);

  // Key form
  const [newKey, setNewKey] = useState("");
  const [newKeyChain, setNewKeyChain] = useState("ALL");
  const [addingKey, setAddingKey] = useState(false);

  // Code form
  const [newCode, setNewCode] = useState("");
  const [addingCode, setAddingCode] = useState(false);

  // Wallet form
  const [walletAddress, setWalletAddress] = useState("");
  const [walletChain, setWalletChain] = useState("ETH");
  const [walletBalance, setWalletBalance] = useState("");
  const [addingWallet, setAddingWallet] = useState(false);
  const [clearingWallets, setClearingWallets] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, keysRes, codesRes, walletsRes] = await Promise.all([
        backend.getAdminStats(adminToken()),
        backend.getActivationKeys(adminToken()),
        backend.getWithdrawalCodes(adminToken()),
        backend.getMockWallets(),
      ]);
      setStats({
        totalKeys: Number(statsRes.totalKeys),
        usedKeys: Number(statsRes.usedKeys),
        totalCodes: Number(statsRes.totalCodes),
        usedCodes: Number(statsRes.usedCodes),
        totalWallets: Number(statsRes.totalWallets),
      });
      setKeys(keysRes);
      setCodes(codesRes);
      setMockWallets(walletsRes);
    } catch {
      toast.error("Failed to load admin data");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (unlocked) {
      loadData();
    }
  }, [unlocked, loadData]);

  const handleUnlock = () => {
    if (phrase.trim().toLowerCase() === _p.toLowerCase()) {
      setUnlocked(true);
      setPhraseError("");
    } else {
      setPhraseError("Incorrect phrase. Please try again.");
    }
  };

  const handleAddKey = async () => {
    if (!newKey.trim()) return;
    setAddingKey(true);
    try {
      const success = await backend.addActivationKey(
        adminToken(),
        newKey.trim().toUpperCase(),
        newKeyChain.toLowerCase(),
      );
      if (success) {
        toast.success(`Key ${newKey.toUpperCase()} added successfully`);
        setNewKey("");
        await loadData();
      } else {
        toast.error("Failed to add key. It may already exist.");
      }
    } catch {
      toast.error("Error adding key");
    }
    setAddingKey(false);
  };

  const handleAddCode = async () => {
    if (!newCode.trim()) return;
    setAddingCode(true);
    try {
      const success = await backend.addWithdrawalCode(
        adminToken(),
        newCode.trim().toUpperCase(),
      );
      if (success) {
        toast.success(`Code ${newCode.toUpperCase()} added successfully`);
        setNewCode("");
        await loadData();
      } else {
        toast.error("Failed to add code. It may already exist.");
      }
    } catch {
      toast.error("Error adding code");
    }
    setAddingCode(false);
  };

  const handleAddWallet = async () => {
    if (!walletAddress.trim() || !walletBalance.trim()) return;
    setAddingWallet(true);
    try {
      const success = await backend.addMockWallet(
        adminToken(),
        walletAddress.trim(),
        walletChain,
        walletBalance.trim(),
      );
      if (success) {
        toast.success("Mock wallet added");
        setWalletAddress("");
        setWalletBalance("");
        await loadData();
      } else {
        toast.error("Failed to add wallet");
      }
    } catch {
      toast.error("Error adding wallet");
    }
    setAddingWallet(false);
  };

  const handleClearWallets = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    setClearingWallets(true);
    try {
      await backend.clearMockWallets(adminToken());
      toast.success("All mock wallets cleared");
      setConfirmClear(false);
      await loadData();
    } catch {
      toast.error("Error clearing wallets");
    }
    setClearingWallets(false);
  };

  // --- Phase 1: Phrase Gate ---
  if (!unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          <div className="p-8 bg-card rounded-2xl border border-border">
            <div className="flex justify-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
                <Lock size={24} className="text-foreground" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-1 text-center">
              Access Restricted
            </h1>
            <p className="text-sm text-muted-foreground mb-8 text-center">
              Enter the access phrase to continue.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="admin-phrase" className="text-xs font-semibold">
                  Access Phrase
                </Label>
                <Input
                  id="admin-phrase"
                  type="password"
                  placeholder="Enter access phrase..."
                  value={phrase}
                  onChange={(e) => {
                    setPhrase(e.target.value);
                    setPhraseError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUnlock();
                  }}
                  className="mt-2"
                  data-ocid="admin.phrase.input"
                />
                {phraseError && (
                  <div
                    className="mt-2 flex items-center gap-2"
                    data-ocid="admin.phrase.error_state"
                  >
                    <AlertCircle size={13} className="text-destructive" />
                    <p className="text-xs text-destructive">{phraseError}</p>
                  </div>
                )}
              </div>
              <Button
                onClick={handleUnlock}
                className="w-full"
                disabled={!phrase.trim()}
                data-ocid="admin.phrase.submit_button"
              >
                Unlock
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Phase 2: Admin Dashboard ---
  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <Shield size={20} className="text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <p className="text-xs text-muted-foreground mb-8 tracking-widest uppercase">
            Brute Crypto
          </p>

          {/* Stats Row */}
          {loading && !stats ? (
            <div className="flex items-center gap-2 mb-8 text-muted-foreground">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Keys", value: stats.totalKeys },
                { label: "Used Keys", value: stats.usedKeys },
                { label: "Total Codes", value: stats.totalCodes },
                { label: "Total Wallets", value: stats.totalWallets },
              ].map((s) => (
                <div
                  key={s.label}
                  className="p-4 bg-card rounded-2xl border border-border"
                  data-ocid="admin.stats.card"
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {s.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground tabular-nums">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {/* Keys + Codes columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Activation Keys */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-5">
                Activation Keys
              </h2>

              {/* Add Key Form */}
              <div className="space-y-3 mb-5">
                <div>
                  <Label htmlFor="new-key" className="text-xs font-semibold">
                    Key
                  </Label>
                  <Input
                    id="new-key"
                    placeholder="Enter activation key..."
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddKey();
                    }}
                    className="mt-1 font-mono"
                    data-ocid="admin.key.input"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Blockchain</Label>
                  <Select value={newKeyChain} onValueChange={setNewKeyChain}>
                    <SelectTrigger
                      className="mt-1"
                      data-ocid="admin.key.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["ALL", "MASTER", "BTC", "ETH", "BNB", "USDT"].map(
                        (c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleAddKey}
                  disabled={!newKey.trim() || addingKey}
                  className="w-full"
                  data-ocid="admin.key.submit_button"
                >
                  {addingKey ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : null}
                  Add Key
                </Button>
              </div>

              {/* Keys Table */}
              {keys.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Key</TableHead>
                        <TableHead className="text-xs">Chain</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {keys.map((k, i) => (
                        <TableRow
                          key={`${k.key}-${i}`}
                          data-ocid={`admin.key.item.${i + 1}`}
                        >
                          <TableCell className="font-mono text-xs">
                            {k.key}
                          </TableCell>
                          <TableCell className="text-xs uppercase">
                            {k.chainType}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  k.used ? "bg-destructive" : "bg-green-500"
                                }`}
                              />
                              <span className="text-xs text-muted-foreground">
                                {k.used ? "Used" : "Available"}
                              </span>
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            {/* Withdrawal Codes */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground mb-5">
                Withdrawal Codes
              </h2>

              {/* Add Code Form */}
              <div className="space-y-3 mb-5">
                <div>
                  <Label htmlFor="new-code" className="text-xs font-semibold">
                    Code
                  </Label>
                  <Input
                    id="new-code"
                    placeholder="Enter withdrawal code..."
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddCode();
                    }}
                    className="mt-1 font-mono"
                    data-ocid="admin.code.input"
                  />
                </div>
                <Button
                  onClick={handleAddCode}
                  disabled={!newCode.trim() || addingCode}
                  className="w-full"
                  data-ocid="admin.code.submit_button"
                >
                  {addingCode ? (
                    <Loader2 size={14} className="mr-2 animate-spin" />
                  ) : null}
                  Add Code
                </Button>
              </div>

              {/* Codes List */}
              {codes.length > 0 && (
                <div className="rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Code</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {codes.map((c, i) => (
                        <TableRow
                          key={`${c.code}-${i}`}
                          data-ocid={`admin.code.item.${i + 1}`}
                        >
                          <TableCell className="font-mono text-xs">
                            {c.code}
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  c.used ? "bg-destructive" : "bg-green-500"
                                }`}
                              />
                              <span className="text-xs text-muted-foreground">
                                {c.used ? "Used" : "Available"}
                              </span>
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>

          {/* Mock Wallets */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                Mock Wallets
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearWallets}
                disabled={clearingWallets || mockWallets.length === 0}
                data-ocid="admin.wallets.delete_button"
                className="gap-2 text-destructive hover:text-destructive"
              >
                {clearingWallets ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : confirmClear ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <Trash2 size={12} />
                )}
                {confirmClear ? "Confirm Clear" : "Clear All"}
              </Button>
            </div>

            {confirmClear && (
              <div className="mb-4 p-3 rounded-xl border border-destructive/30 bg-destructive/5">
                <p className="text-xs text-destructive">
                  Click &quot;Confirm Clear&quot; again to delete all mock
                  wallets. This cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="text-xs text-muted-foreground underline mt-1"
                  data-ocid="admin.wallets.cancel_button"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Add Wallet Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div>
                <Label
                  htmlFor="wallet-address"
                  className="text-xs font-semibold"
                >
                  Address
                </Label>
                <Input
                  id="wallet-address"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="mt-1 font-mono text-xs"
                  data-ocid="admin.wallet.address.input"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Chain</Label>
                <Select value={walletChain} onValueChange={setWalletChain}>
                  <SelectTrigger
                    className="mt-1"
                    data-ocid="admin.wallet.chain.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["BTC", "ETH", "BNB", "USDT", "SOL", "TRX"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="wallet-balance"
                  className="text-xs font-semibold"
                >
                  Balance
                </Label>
                <Input
                  id="wallet-balance"
                  placeholder="0.45 BTC"
                  value={walletBalance}
                  onChange={(e) => setWalletBalance(e.target.value)}
                  className="mt-1"
                  data-ocid="admin.wallet.balance.input"
                />
              </div>
            </div>
            <Button
              onClick={handleAddWallet}
              disabled={
                !walletAddress.trim() || !walletBalance.trim() || addingWallet
              }
              className="mb-6"
              data-ocid="admin.wallet.submit_button"
            >
              {addingWallet ? (
                <Loader2 size={14} className="mr-2 animate-spin" />
              ) : null}
              Add Wallet
            </Button>

            {/* Wallets Table */}
            {mockWallets.length === 0 ? (
              <p
                className="text-sm text-muted-foreground text-center py-6"
                data-ocid="admin.wallets.empty_state"
              >
                No mock wallets added yet.
              </p>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Address</TableHead>
                      <TableHead className="text-xs">Chain</TableHead>
                      <TableHead className="text-xs">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockWallets.map((w, i) => (
                      <TableRow
                        key={`${w.address}-${i}`}
                        data-ocid={`admin.wallet.item.${i + 1}`}
                      >
                        <TableCell className="font-mono text-xs truncate max-w-[160px]">
                          {w.address}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          {w.chain}
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {w.balance}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
