import { Link, useRouterState } from "@tanstack/react-router";
import {
  Github,
  LifeBuoy,
  Moon,
  Search,
  Sun,
  Twitter,
  Wallet,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import AnimatedBackground from "./AnimatedBackground";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const [chainsSelected, setChainsSelected] = useState(false);
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname intentionally triggers re-check
  useEffect(() => {
    const check = () => {
      setChainsSelected(!!localStorage.getItem("brute-chains"));
    };
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, [pathname]);

  // Show nav only from /search onwards — hidden on homepage, login, and select-chain
  const hiddenPages = ["/", "/login", "/select-chain"];
  const showNav = chainsSelected && !hiddenPages.includes(pathname);

  const navLinks = [
    { label: "Search", href: "/search", icon: Search },
    { label: "Assets", href: "/assets", icon: Wallet },
    { label: "Support", href: "/support", icon: LifeBuoy },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative">
      <AnimatedBackground />

      <main
        className={`flex-1 page-fade-in relative z-10 ${showNav ? "pb-28" : ""}`}
      >
        {children}
      </main>

      <footer
        className={`border-t border-border relative z-10 ${showNav ? "pb-28" : ""}`}
      >
        <div className="container-brute py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="font-bold tracking-wider uppercase text-sm text-foreground">
                Brute Crypto
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                &copy; {new Date().getFullYear()} Brute Crypto. All rights
                reserved.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                to="/support"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/support"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/support"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Twitter size={16} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github size={16} />
              </a>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()}. Built with &#x2764;&#xFE0F;
              using{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Pill Bottom Navigation Bar — appears only from /search onwards */}
      <AnimatePresence>
        {showNav && (
          <motion.nav
            aria-label="Bottom navigation"
            className="fixed bottom-5 left-1/2 z-50"
            style={{ width: "min(680px, calc(100vw - 24px))", x: "-50%" }}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 32,
              mass: 0.9,
            }}
          >
            <div
              className="flex items-center px-2 py-1.5 rounded-full backdrop-blur-2xl border border-border/60 overflow-hidden"
              style={{
                background:
                  theme === "dark"
                    ? "oklch(0.12 0 0 / 0.92)"
                    : "oklch(0.98 0 0 / 0.92)",
                boxShadow:
                  theme === "dark"
                    ? "0 8px 40px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(1 0 0 / 0.08)"
                    : "0 8px 40px oklch(0 0 0 / 0.12), 0 0 0 1px oklch(0 0 0 / 0.06)",
              }}
            >
              {/* Logo */}
              <Link
                to="/"
                data-ocid="nav.home.link"
                className="font-bold text-[11px] tracking-widest uppercase text-foreground hover:opacity-70 transition-opacity shrink-0 px-2 py-1"
              >
                <span className="hidden sm:inline">Brute</span>
                <span className="sm:hidden">BC</span>
              </Link>

              <div className="w-px h-4 bg-border/60 shrink-0 mx-1" />

              {/* Nav links */}
              <div className="flex items-center flex-1 justify-center gap-0.5 min-w-0 overflow-hidden">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      data-ocid={`nav.${link.label.toLowerCase().replace(" ", "-")}.link`}
                      className={`flex flex-col items-center gap-0.5 px-2 sm:px-3 py-1 rounded-full text-[10px] font-medium transition-all shrink-0 ${
                        isActive
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/8"
                      }`}
                    >
                      <Icon size={13} strokeWidth={isActive ? 2.5 : 1.8} />
                      <span className="hidden sm:inline whitespace-nowrap">
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="w-px h-4 bg-border/60 shrink-0 mx-1" />

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                data-ocid="nav.theme.toggle"
                aria-label={
                  theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                className="shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10px] font-medium text-muted-foreground hover:text-foreground border border-border/60 hover:border-border transition-all"
              >
                {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
                <span className="hidden sm:inline">
                  {theme === "dark" ? "Light" : "Dark"}
                </span>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
