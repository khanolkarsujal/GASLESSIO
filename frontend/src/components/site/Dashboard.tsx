import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { shortenAddress } from "@/lib/utils";

interface DashboardProps {
  wallet: any;
  collection: any;
  paymentCompleted: boolean;
  simStep: number;
  simActive: boolean;
  progress: number;
}

export function Dashboard({ wallet, collection, paymentCompleted, simStep, simActive, progress }: DashboardProps) {
  const [ethBalance, setEthBalance] = useState("0.00");
  const isConnected = !!(wallet.account && wallet.isRightChain);

  useEffect(() => {
    if (isConnected && typeof window !== "undefined" && (window as any).ethereum) {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      provider.getBalance(wallet.account)
        .then((bal) => {
          setEthBalance(parseFloat(ethers.formatEther(bal)).toFixed(4));
        })
        .catch(() => setEthBalance("0.00"));
    } else {
      setEthBalance("0.00");
    }
  }, [wallet.account, wallet.isRightChain, isConnected]);

  return (
    <section id="dashboard" className="py-24 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left column: Live interactive card */}
        <div className="card-glow rounded-3xl p-6 relative bg-card/30 border border-border">
          <div className="absolute -inset-8 bg-glow-radial pointer-events-none" />
          <div className="flex items-center justify-between relative z-10 border-b border-border/50 pb-4 mb-4">
            <div>
              <div className="font-mono-label text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Gasless Wallet Metrics</div>
              <h3 className="mt-1 font-display font-semibold text-lg text-white">Live Payment Session</h3>
            </div>
            <button
              onClick={!isConnected ? wallet.connect : undefined}
              className={`rounded-full border border-border px-4 py-1.5 text-xs font-semibold transition ${
                isConnected ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/20 cursor-default" : "bg-card/60 text-white hover:bg-card cursor-pointer"
              }`}
            >
              {isConnected ? shortenAddress(wallet.account) : "Connect Wallet"}
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
            {/* Wallet State Card */}
            <div className="rounded-2xl border border-border bg-secondary/40 p-5 flex flex-col justify-between">
              <div>
                <div className="font-mono-label text-muted-foreground text-[10px] uppercase font-bold tracking-wider">SaaS Permit State</div>
                <Row label="Wallet Status" value={isConnected ? "Connected" : "Disconnected"} />
                <Row label="Balance" value={isConnected && collection.tyiBalance !== null ? `${collection.tyiBalance.toFixed(2)} TYI` : "0.00 TYI"} violet />
                <Row label="Network" value="Base Sepolia" />
                <Row label="Gas Token" value="Mock USD" />
                <Row label="ETH Balance" value={`${ethBalance} ETH`} />
              </div>
              <div className="mt-4 rounded-xl bg-[var(--mint)]/10 border border-[var(--mint)]/20 text-[var(--mint)] text-[10px] px-3 py-2 flex justify-between font-bold uppercase tracking-wider">
                <span>Gas Status</span>
                <span>Sponsored</span>
              </div>
            </div>

            {/* Transaction Steps Card */}
            <div className="rounded-2xl border border-border bg-secondary/40 p-5 space-y-3">
              <div className="font-mono-label text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Checkout Milestone</div>
              
              {/* Progress Bar */}
              <div className="mt-2">
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{paymentCompleted ? "100%" : `${Math.round(progress)}%`}</span>
                </div>
                <div className="h-3 rounded-full bg-white/20 overflow-hidden border border-border/30">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ease-out ${
                      paymentCompleted 
                        ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                        : progress > 0 || simActive
                          ? "bg-gradient-to-r from-[var(--violet)] to-[var(--pink)] shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
                          : "bg-white/40"
                    }`}
                    style={{ width: `${paymentCompleted ? 100 : Math.max(progress, 5)}%` }}
                  />
                </div>
              </div>

              <StepLine
                n={1}
                title="Initiate Checkout"
                body="Configure developer permit."
                active={simActive && simStep === 1}
                done={paymentCompleted || simStep > 1}
              />
              <StepLine
                n={2}
                title="Settle Gasless"
                body="Authorize Mock USD deduction."
                active={simActive && (simStep === 2 || simStep === 3)}
                done={paymentCompleted || simStep > 3}
              />
              <StepLine
                n={3}
                title="Purchase Success"
                body="License key issued on-chain."
                active={simActive && simStep === 4}
                done={paymentCompleted || simStep === 5}
                mint
              />
            </div>
          </div>
        </div>

        {/* Right column: Copy */}
        <div>
          <div className="font-mono-label text-[var(--violet)] text-xs font-semibold uppercase tracking-widest">Why this matters</div>
          <h2 className="mt-4 font-display font-bold text-4xl md:text-5xl leading-tight">
            Seamless checkout.<br />No gas hurdles.
          </h2>
          <p className="mt-6 text-muted-foreground text-sm leading-relaxed max-w-md">
            Normally, checking out or subscribing to web3 services requires holding native network gas (ETH) and navigating bridging procedures. UGF allows users to settle transactions in Mock USD directly, shielding them from network fee complexity.
          </p>
          <div className="mt-6 card-glow rounded-2xl p-5 border border-border bg-card/10 max-w-md">
            <h4 className="font-display font-semibold text-white">Base Sepolia SDK Settlement</h4>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Integrated with the UGF oracle contracts on Base Sepolia. The EIP-191 authentication and ERC-3009 permit signatures abstract blockchain native gas away, providing a Web2-like checkout experience.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Row({ label, value, violet }: { label: string; value: string; violet?: boolean }) {
  return (
    <div className="mt-3 flex items-center justify-between border-b border-border/50 pb-1.5">
      <span className={`text-xs ${violet ? "text-[var(--violet)] font-bold" : "text-muted-foreground"}`}>{label}</span>
      <span className="font-display text-xs font-semibold text-white">{value}</span>
    </div>
  );
}

function StepLine({
  n, title, body, mint, active, done
}: { n: number; title: string; body: string; mint?: boolean; active: boolean; done: boolean }) {
  const stepBg = done
    ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]"
    : active
    ? "bg-gradient-to-br from-[var(--violet)] to-[var(--pink)] text-white shadow-[0_0_15px_oklch(0.7_0.22_295_/_0.4)] animate-pulse"
    : "bg-white/5 border border-border text-muted-foreground";

  return (
    <div className={`flex gap-3 transition-opacity duration-300 ${!active && !done ? "opacity-60" : "opacity-100"}`}>
      <span className={`shrink-0 w-6 h-6 rounded-full grid place-items-center text-[10px] font-bold ${stepBg}`}>
        {done ? "✓" : n}
      </span>
      <div>
        <div className={`text-xs font-bold ${done ? "text-emerald-400" : active ? "text-white" : "text-slate-300"}`}>{title}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{body}</div>
      </div>
    </div>
  );
}
