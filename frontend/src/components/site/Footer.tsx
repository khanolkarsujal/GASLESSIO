import { Link2 } from "lucide-react";
import { CONTRACT_ADDRESS } from "@/contractConfig";
import { basescanAddress, shortenAddress } from "@/lib/utils";

export function Footer() {
  return (
    <footer className="border-t border-border/40 py-16">
      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-8 h-8 rounded-full border border-border bg-card">
              <Link2 className="w-3.5 h-3.5" />
            </span>
            <span className="font-display font-semibold tracking-[0.3em] text-sm">GASLESSIO</span>
          </div>

          <p className="mt-5 text-sm text-muted-foreground max-w-xs">
            A beginner-friendly dApp on Base Sepolia. Pay gas in Mock USD with the Universal Gas Framework — never touch ETH.
          </p>
          <div className="mt-6 font-mono-label text-[var(--violet)] font-bold text-xs uppercase tracking-widest">Built on Base</div>
        </div>

        <div>
          <div className="font-mono-label text-[var(--violet)] font-bold text-xs uppercase tracking-widest">Product</div>
          <ul className="mt-5 space-y-3 text-sm">
            <li><a href="#features" className="text-muted-foreground hover:text-foreground transition">Features</a></li>
            <li><a href="#how" className="text-muted-foreground hover:text-foreground transition">How It Works</a></li>
            <li><a href="#dashboard" className="text-muted-foreground hover:text-foreground transition">Dashboard</a></li>
            <li><a href="#playground" className="text-muted-foreground hover:text-foreground transition">Launch App</a></li>
          </ul>
        </div>

        <div>
          <div className="font-mono-label text-[var(--violet)] font-bold text-xs uppercase tracking-widest">Resources</div>
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a
                href="https://github.com/khanolkarsujal/GasFree-Badge"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://universalgasframework.com/docs/overview"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition"
              >
                UGF Docs ↗
              </a>
            </li>
            <li>
              <a
                href={basescanAddress(CONTRACT_ADDRESS)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition"
              >
                BaseScan ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row justify-between gap-4 text-xs text-muted-foreground">
        <span>© 2026 Gaslessio. Universal Gas Framework Hackathon.</span>
        <div className="flex items-center gap-2">
          <span>Contract:</span>
          <a
            href={basescanAddress(CONTRACT_ADDRESS)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono hover:text-white transition select-all"
          >
            {shortenAddress(CONTRACT_ADDRESS)}
          </a>
        </div>
      </div>
    </footer>
  );
}
