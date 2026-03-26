import { useNavigate } from "@tanstack/react-router";
import { AlertCircle, KeyRound } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { validateKey } from "../lib/keys";

export default function Login() {
  const navigate = useNavigate();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handleActivate = () => {
    const trimmed = key.trim();
    const result = validateKey(trimmed);

    if (result.type === "invalid") {
      setError("Invalid activation key. Please check your key and try again.");
      return;
    }

    localStorage.setItem("brute-activation-key", trimmed);

    if (result.type === "master") {
      localStorage.setItem("brute-master-key", "true");
      localStorage.removeItem("brute-key-chains");
    } else if (result.type === "all") {
      localStorage.setItem("brute-master-key", "all");
      localStorage.removeItem("brute-key-chains");
    } else if (result.type === "chain") {
      localStorage.removeItem("brute-master-key");
      localStorage.setItem("brute-key-chains", JSON.stringify([result.chain]));
    }

    navigate({ to: "/select-chain" });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleActivate();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="p-8 bg-card rounded-2xl border border-border">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
              <KeyRound size={24} className="text-foreground" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2 text-center">
            Activation Key
          </h1>
          <p className="text-sm text-muted-foreground mb-8 text-center">
            Enter your key to access the recovery suite.
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="activation-key"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Enter Activation Key
              </label>
              <input
                id="activation-key"
                type="password"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter your activation key"
                data-ocid="login.input"
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              />
              {error && (
                <div
                  className="mt-2 flex items-center gap-2"
                  data-ocid="login.error_state"
                >
                  <AlertCircle
                    size={13}
                    className="text-destructive shrink-0"
                  />
                  <p className="text-xs text-destructive">{error}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleActivate}
              data-ocid="login.submit_button"
              className="w-full py-3 rounded-full bg-foreground text-background font-semibold text-sm hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Activate
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Need a key?{" "}
            <a
              href="https://t.me/brutecryptoadm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-2"
            >
              Purchase activation
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
