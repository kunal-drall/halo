'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Search, 
  Plus, 
  Wallet, 
  User 
} from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center py-2 px-3 min-h-[44px] min-w-[44px] rounded-lg transition-colors',
        isActive 
          ? 'text-blue-600 bg-blue-50' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      )}
    >
      <Icon className={cn('h-5 w-5 mb-1', isActive && 'text-blue-600')} />
      <span className={cn('text-xs font-medium', isActive && 'text-blue-600')}>
        {label}
      </span>
    </Link>
  );
}

export function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: 'Home',
    },
    {
      href: '/discover',
      icon: Search,
      label: 'Discover',
    },
    {
      href: '/create',
      icon: Plus,
      label: 'Create',
    },
    {
      href: '/wallet',
      icon: Wallet,
      label: 'Wallet',
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profile',
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          
          return (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isActive}
            />
          );
        })}
      </div>
    </nav>
  );
}

