import { useNavigate } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function Search() {
  const navigate = useNavigate();
  const [chains, setChains] = useState<string[]>([]);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("brute-activation-key")) {
      navigate({ to: "/login" });
      return;
    }
    setIsVip(localStorage.getItem("brute-master-key") === "true");
    const stored = localStorage.getItem("brute-chains");
    if (stored) {
      try {
        setChains(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, [navigate]);

  return (
    <div className="section-padding">
      <div className="container-brute">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
              Dashboard
            </p>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Wallet Scanner
              </h1>
              {isVip && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground text-background text-[10px] font-bold tracking-widest uppercase"
                  data-ocid="search.vip.badge"
                >
                  <Crown size={10} />
                  VIP
                </span>
              )}
            </div>
          </div>

          {chains.length > 0 && (
            <div className="mb-6 text-sm text-muted-foreground">
              Scanning:{" "}
              <span className="text-foreground">
                {chains.map((c) => c.toUpperCase()).join(", ")}
              </span>
            </div>
          )}

          <div className="p-6 sm:p-10 bg-card rounded-2xl border border-border flex flex-col items-center justify-center min-h-[300px] text-center">
            <p className="text-sm text-muted-foreground">
              Scanner is active. Results will appear here when wallets are
              found.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
