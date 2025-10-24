'use client';

import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function WalletWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full">
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return <WalletMultiButton className="w-full" />;
}

