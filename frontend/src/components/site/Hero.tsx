import { useState, useEffect } from "react";
import { Wallet, Zap, ArrowRight, Github, CheckCircle, ExternalLink, X } from "lucide-react";
import { ethers } from "ethers";
import { shortenAddress } from "@/lib/utils";

interface HeroProps {
  wallet: any;
  collection: any;
  onMint?: (badgeType?: number) => Promise<void>;
  isMinting?: boolean;
  mintSuccess?: boolean;
  progress?: number;
  txHash?: string;
}

export function Hero({ wallet, collection, onMint, isMinting, mintSuccess, progress, txHash }: HeroProps) {
  const [ethBalance, setEthBalance] = useState<string>("0.00");

  useEffect(() => {
    if (wallet.account && wallet.isRightChain && typeof window !== "undefined" && (window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      provider.getBalance(wallet.account)
        .then((bal) => {
          setEthBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
        })
        .catch((err) => {
          console.error("Failed to get ETH balance:", err);
          setEthBalance("0.00");
        });
    } else {
      setEthBalance("0.00");
    }
  }, [wallet.account, wallet.isRightChain]);

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const isConnected = !!(wallet.account && wallet.isRightChain);

  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      <div className="absolute inset-0 bg-glow-radial pointer-events-none" />
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center relative">
        {/* Left Column */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1.5 backdrop-blur animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--mint)] shadow-[0_0_8px_var(--mint)]" />
            <span className="font-mono-label text-muted-foreground text-xs font-semibold tracking-wider uppercase">Powered by Universal Gas Framework</span>
          </div>

          <h1 className="mt-7 font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
            Pay gas with<br />
            Mock USD. <span className="text-gradient-violet">No ETH needed.</span>
          </h1>

          <p className="mt-6 text-muted-foreground text-base max-w-md leading-relaxed">
            A beginner-friendly dApp on Base Sepolia powered by the Universal Gas Framework. Skip the ETH funding step — sign in, act on-chain, and let UGF settle your gas in Mock USD.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {onMint && (
              <button
                onClick={() => onMint(0)}
                disabled={isMinting || mintSuccess}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:bg-white/90 hover:shadow-[0_0_50px_rgba(255,255,255,0.8)] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white/20"
              >
                {mintSuccess ? (
                  <>
                    <Zap className="w-4 h-4 text-emerald-600" /> Badge Minted!
                  </>
                ) : isMinting ? (
                  <>
                    <Zap className="w-4 h-4 text-[var(--violet)] animate-spin" /> Minting...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-[var(--violet)]" /> Mint Badge
                  </>
                )}
              </button>
            )}
            <a
              href="https://github.com/khanolkarsujal/GasFree-Badge"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/30 px-5 py-3 text-sm font-medium hover:bg-card transition"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 pt-8 border-t border-border/60 max-w-md">
            <Stat label="Gas Cost" value="0 ETH" accent />
            <Stat label="Network" value="Base Sepolia" />
            <Stat label="Settlement" value="Mock USD" />
          </div>
        </div>

        {/* Loading Modal */}
        {isMinting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(139,92,246,0.3)] animate-in zoom-in duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[var(--violet)] to-[var(--pink)] flex items-center justify-center mb-6 animate-pulse">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="font-display font-bold text-2xl text-white mb-2">
                  Processing Transaction
                </h3>
                
                <p className="text-sm text-muted-foreground mb-6">
                  Please wait while we process your transaction on Base Sepolia.
                </p>
                
                <div className="w-full">
                  <div className="flex justify-between text-sm font-semibold text-white mb-3">
                    <span>Transaction Progress</span>
                    <span>{Math.round(progress || 0)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-white/10 overflow-hidden border border-border/50 relative">
                    <div 
                      className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-[var(--violet)] to-[var(--pink)] shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                      style={{ width: `${Math.max(progress || 0, 5)}%` }}
                    />
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground text-center">
                    {(progress || 0) < 25 && "Authenticating wallet..."}
                    {(progress || 0) >= 25 && (progress || 0) < 50 && "Getting transaction quote..."}
                    {(progress || 0) >= 50 && (progress || 0) < 75 && "Settling payment..."}
                    {(progress || 0) >= 75 && (progress || 0) < 100 && "Executing transaction..."}
                    {(progress || 0) === 100 && "Transaction complete!"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {mintSuccess && txHash && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(16,185,129,0.3)] animate-in zoom-in duration-300">
              <button
                onClick={() => window.location.reload()}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6">
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
                
                <h3 className="font-display font-bold text-2xl text-white mb-2">
                  Badge Minted Successfully!
                </h3>
                
                <p className="text-sm text-muted-foreground mb-6">
                  Your GasFree Badge has been minted on Base Sepolia.
                </p>
                
                <div className="w-full space-y-4">
                  <div className="rounded-xl border border-border bg-secondary/40 p-4">
                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                      Transaction Hash
                    </div>
                    <div className="font-mono text-xs text-[var(--violet)] break-all">
                      {txHash}
                    </div>
                  </div>
                  
                  <a
                    href={`https://sepolia.basescan.org/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full rounded-full bg-white text-black px-4 py-3 text-sm font-bold hover:bg-white/90 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Base Sepolia Explorer
                  </a>
                  
                  <button
                    onClick={() => window.location.reload()}
                    className="w-full rounded-full border border-border bg-card/30 px-4 py-3 text-sm font-medium hover:bg-card transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Column (Wallet Card Dashboard) */}
        <div className="relative">
          <div className="absolute -inset-8 bg-glow-radial pointer-events-none" />
          <div className="card-glow rounded-2xl p-5 relative bg-black/40 border border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-secondary grid place-items-center border border-border">
                  <Wallet className="w-4 h-4" />
                </span>
                <div>
                  <div className="font-mono-label text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Wallet</div>
                  <div className="font-mono text-sm text-white">
                    {isConnected ? shortenAddress(wallet.account) : "Not Connected"}
                  </div>
                </div>
              </div>
              <span className={`rounded-full text-xs px-2.5 py-1 border ${
                isConnected
                  ? "bg-[var(--mint)]/15 text-[var(--mint)] border-[var(--mint)]/30 animate-pulse"
                  : "bg-white/5 text-muted-foreground border-border"
              }`}>
                {isConnected ? "Connected" : "Offline"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-secondary/40 p-4 flex flex-col justify-between">
                <div>
                  <div className="font-mono-label text-muted-foreground text-[10px] uppercase font-bold tracking-wider">ETH Balance</div>
                  <div className="mt-2 text-xl font-display font-semibold text-white">
                    {ethBalance} <span className="text-xs text-muted-foreground font-sans">ETH</span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground leading-snug">
                  {parseFloat(ethBalance) < 0.001
                    ? "Insufficient ETH for gas fees. UGF allows execution anyway."
                    : "Native ETH is ignored. Gas is sponsored by UGF."}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-secondary/40 p-4 flex flex-col justify-between">
                <div>
                  <div className="font-mono-label text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Mock USD</div>
                  <div className="mt-2 text-xl font-display font-semibold text-[var(--mint)]">
                    {isConnected && collection.tyiBalance !== null
                      ? `$${collection.tyiBalance.toFixed(2)}`
                      : "$0.00"}
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-muted-foreground leading-snug">
                  {isConnected && collection.tyiBalance !== null && collection.tyiBalance > 0
                    ? "Claim, mint, or transfer without gas worries."
                    : "Pre-funded stablecoin. Get more free from the faucet."}
                </div>
              </div>
            </div>

            {/* Simulated Live Transaction pipeline graph */}
            <div className="mt-3 rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono-label text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Transaction Pipeline</span>
                <span className="text-[var(--mint)] text-xs font-semibold">100% Sponsored</span>
              </div>
              <div className="mt-4 flex items-end justify-between gap-2 h-20">
                {[45, 65, 55, 95, 75, 45, 80].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm transition-all duration-500"
                    style={{
                      height: `${h}%`,
                      background: i === 3
                        ? "linear-gradient(180deg, var(--violet), var(--pink))"
                        : "linear-gradient(180deg, var(--border), rgba(255,255,255,0.05))",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="font-mono-label text-muted-foreground text-[10px] uppercase font-bold tracking-wider">{label}</div>
      <div className={`mt-2 font-display font-semibold text-sm ${accent ? "text-[var(--mint)] font-bold" : "text-white"}`}>{value}</div>
    </div>
  );
}
