import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Link2, Wallet } from "lucide-react";
import { ethers } from "ethers";

interface NavbarProps {
  wallet: any;
  collection: any;
  platform: any;
  platformAuth: any;
  setPlatformTick: React.Dispatch<React.SetStateAction<number>>;
}

const nav = [
  { label: "Dashboard", href: "#dashboard" },
];

export function Navbar({ wallet, collection, platform, platformAuth, setPlatformTick }: NavbarProps) {
  const [ethBalance, setEthBalance] = useState("0.00");
  const isConnected = !!(wallet.account && wallet.isRightChain);

  // Get ETH balance
  if (isConnected && typeof window !== "undefined" && (window as any).ethereum) {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    provider.getBalance(wallet.account)
      .then((bal) => {
        setEthBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
      })
      .catch(() => setEthBalance("0.00"));
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/40 backdrop-blur-xl bg-background/60">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="relative grid place-items-center w-8 h-8 rounded-full border border-border bg-card">
            <Link2 className="w-3.5 h-3.5 text-foreground" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--mint)] shadow-[0_0_8px_var(--mint)]" />
          </span>
          <span className="font-display font-semibold tracking-[0.3em] text-sm">GASLESSIO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-border bg-card/60 px-2 py-1.5 backdrop-blur">
          {nav.map((n) => (
            <a key={n.label} href={n.href} className="px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full font-medium">
              {n.label}
            </a>
          ))}
          <a
            href="https://github.com/khanolkarsujal/GasFree-Badge#readme"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-full font-medium"
          >
            GitHub
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {/* Wallet Info Card */}
          {wallet.account && wallet.isRightChain && (
            <div className="hidden lg:flex items-center gap-4 rounded-full border border-border bg-card/40 px-4 py-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[var(--violet)]" />
                <span className="text-xs text-muted-foreground">Wallet Status</span>
                <span className="text-xs font-semibold text-white">Connected</span>
              </div>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Balance</span>
                <span className="text-xs font-semibold text-[var(--violet)]">
                  {collection.tyiBalance !== null ? `${collection.tyiBalance.toFixed(2)} TYI` : "0.00 TYI"}
                </span>
              </div>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">ETH</span>
                <span className="text-xs font-semibold text-white">{ethBalance} ETH</span>
              </div>
            </div>
          )}

          {/* Main Wallet Connection Trigger */}
          <button
            onClick={
              !wallet.account
                ? wallet.connect
                : !wallet.isRightChain
                ? wallet.switchToBaseSepolia
                : undefined
            }
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${
              wallet.account && !wallet.isRightChain
                ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                : "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.6)] hover:bg-white/90 hover:shadow-[0_0_40px_rgba(255,255,255,0.8)] border-2 border-white/20"
            }`}
          >
            {!wallet.account
              ? "Connect Wallet"
              : !wallet.isRightChain
              ? "Switch Network"
              : `${wallet.account.slice(0, 6)}...${wallet.account.slice(-4)}`}
          </button>
        </div>
      </div>
    </header>
  );
}
