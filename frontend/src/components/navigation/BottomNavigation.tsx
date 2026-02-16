"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PlusCircle, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isCreate?: boolean;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/circles", label: "Circles", icon: Users },
  { href: "/circles/create", label: "Create", icon: PlusCircle, isCreate: true },
  { href: "/trust-score", label: "Trust", icon: Shield },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "border-t border-white/10",
        "bg-[#0B0F1A]/80 backdrop-blur-xl",
        "pb-safe"
      )}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          if (item.isCreate) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-0.5 -mt-4"
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full",
                    "bg-white text-[#0B0F1A]",
                    "hover:bg-neutral-200 transition-colors"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-medium text-white">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-16 py-1",
                "transition-colors duration-200",
                isActive ? "text-white" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-all",
                  isActive && "scale-110"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isActive && "text-white"
                )}
              >
                {item.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 rounded-full bg-white" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
