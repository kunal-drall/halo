"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Menu,
  X,
  ChevronDown,
  Wallet,
  LogOut,
  User,
  Shield,
  LayoutDashboard,
  CreditCard,
} from "lucide-react";
import { cn, shortenAddress } from "../../lib/utils";
import { useAuth } from "@/contexts/WalletContext";

const authenticatedLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/circles", label: "Circles", icon: null },
  { href: "/trust-score", label: "Trust Score", icon: Shield },
  { href: "/yield", label: "Yield", icon: null },
  { href: "/card", label: "Card", icon: CreditCard },
];

const publicLinks = [
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/card", label: "Card" },
];

const dropdownLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trust-score", label: "Trust Score", icon: Shield },
  { href: "/profile", label: "Profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const { connected, publicKey } = useWallet();
  const { isAuthenticated, isAuthenticating, handleDisconnect } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const navLinks = isAuthenticated ? authenticatedLinks : publicLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F1A]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-baseline gap-1 shrink-0">
          <span className="text-white font-bold text-lg">Halo</span>
          <span className="text-neutral-400 text-sm">Protocol</span>
        </Link>

        {/* Center: Desktop navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === link.href
                  ? "text-white"
                  : "text-neutral-400 hover:text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isAuthenticated && publicKey ? (
            <>
              {/* Wallet badge */}
              <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white">
                <Wallet className="h-3.5 w-3.5 text-neutral-400" />
                <span>{shortenAddress(publicKey.toBase58())}</span>
              </div>

              {/* User dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    "hidden md:flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm transition-colors",
                    "text-neutral-400 hover:text-white hover:bg-white/5"
                  )}
                  aria-label="User menu"
                >
                  <User className="h-4 w-4" />
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      dropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-white/10 rounded-lg shadow-lg overflow-hidden">
                    <div className="py-1">
                      {dropdownLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                              "flex items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                              pathname === link.href
                                ? "text-white bg-white/5"
                                : "text-neutral-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {link.label}
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-white/10">
                      <button
                        onClick={async () => {
                          await handleDisconnect();
                          setDropdownOpen(false);
                        }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Disconnect
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticating && (
                <span className="text-xs text-white/40 animate-pulse">Signing in...</span>
              )}
              <WalletMultiButton />
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0F1A]/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-1 pb-safe">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "text-white bg-white/5"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && publicKey && (
              <>
                <div className="border-t border-white/10 my-2" />
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-400">
                  <Wallet className="h-4 w-4" />
                  <span>{shortenAddress(publicKey.toBase58())}</span>
                </div>
                {dropdownLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        pathname === link.href
                          ? "text-white bg-white/5"
                          : "text-neutral-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}
                <button
                  onClick={async () => {
                    await handleDisconnect();
                    setMobileOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Disconnect
                </button>
              </>
            )}

            {!isAuthenticated && (
              <>
                <div className="border-t border-white/10 my-2" />
                <div className="px-3 py-2">
                  <WalletMultiButton />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
