import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format lamports/token amounts for display
export function formatTokenAmount(
  amount: number | bigint,
  decimals: number = 6
): string {
  const num = Number(amount) / Math.pow(10, decimals);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Format SOL amount
export function formatSOL(lamports: number | bigint): string {
  return formatTokenAmount(lamports, 9);
}

// Shorten a Solana address for display
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

// Format a timestamp to relative time
export function timeAgo(timestamp: number | Date): string {
  const now = Date.now();
  const time = timestamp instanceof Date ? timestamp.getTime() : timestamp * 1000;
  const diff = now - time;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

// Format a date for display
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Calculate trust tier color
export function getTrustTierColor(tier: string): string {
  switch (tier.toLowerCase()) {
    case "platinum":
      return "text-purple-400";
    case "gold":
      return "text-yellow-400";
    case "silver":
      return "text-gray-300";
    default:
      return "text-blue-400";
  }
}

// Basis points to percentage
export function bpsToPercent(bps: number): string {
  return (bps / 100).toFixed(2) + "%";
}
