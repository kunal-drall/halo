"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { LogOut, Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn, shortenAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/WalletContext";

export default function WalletConnection() {
  const { publicKey, connected } = useWallet();
  const { handleDisconnect } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey.toBase58());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!connected || !publicKey) {
    return (
      <WalletMultiButton className="!bg-primary-500 !rounded-lg !h-10 !text-sm !font-medium hover:!bg-primary-600 !transition-colors" />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-white/5 border border-white/10 backdrop-blur-sm"
      )}
    >
      {/* Connected indicator */}
      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

      {/* Address */}
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
      >
        <span className="font-mono">
          {shortenAddress(publicKey.toBase58())}
        </span>
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-400" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-white/40" />
        )}
      </button>

      {/* Disconnect */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDisconnect()}
        className="h-7 w-7 text-white/40 hover:text-red-400"
      >
        <LogOut className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
