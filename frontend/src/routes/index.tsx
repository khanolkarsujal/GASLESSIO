import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ethers } from "ethers";

// Component imports
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Dashboard } from "@/components/site/Dashboard";
import { Footer } from "@/components/site/Footer";

// State hooks and services imports
import { useWallet } from "@/hooks/useWallet";
import { useCollection } from "@/hooks/useCollection";
import { executeGaslessClaim } from "@/services/ugfService";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gaslessio — Onchain actions. Zero gas friction." },
      { name: "description", content: "Build on-chain experiences without ETH friction. Gaslessio sponsors fees via Universal Gas Framework on Base Sepolia." },
      { property: "og:title", content: "Gaslessio — Onchain actions. Zero gas friction." },
      { property: "og:description", content: "Sponsored gas. Mock USD pricing. Frictionless Web3 onboarding." },
    ],
  }),
  component: Index,
});

function Index() {
  const wallet = useWallet();
  const collection = useCollection(wallet.account);
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [progress, setProgress] = useState(0);

  const handleMint = async (badgeType: number = 0) => {
    if (!wallet.account) {
      await wallet.connect();
      return;
    }
    if (!wallet.isRightChain) {
      await wallet.switchToBaseSepolia();
      return;
    }

    setIsMinting(true);
    setProgress(0);
    
    // Optimistic UI - show success immediately
    setMintSuccess(true);
    
    try {
      const provider = (window as any).ethereum;
      const signer = await new ethers.BrowserProvider(provider).getSigner();
      
      const hash = await executeGaslessClaim(signer, badgeType, (progressValue: number) => {
        setProgress(progressValue);
      });
      setTxHash(hash);
      collection.refresh(wallet.account);
    } catch (error) {
      setMintSuccess(false);
      setProgress(0);
      console.error("Mint failed:", error);
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative selection:bg-indigo-500/30 selection:text-indigo-100 overflow-x-hidden">
      <Navbar
        wallet={wallet}
        collection={collection}
        platform={null}
        platformAuth={null}
        setPlatformTick={() => {}}
      />
      <main>
        <Hero
          wallet={wallet}
          collection={collection}
          onMint={handleMint}
          isMinting={isMinting}
          mintSuccess={mintSuccess}
          progress={progress}
          txHash={txHash}
        />
        <Dashboard
          wallet={wallet}
          collection={collection}
          paymentCompleted={mintSuccess}
          simStep={mintSuccess ? 5 : 0}
          simActive={isMinting}
          progress={progress}
        />
      </main>
      <Footer />
    </div>
  );
}
