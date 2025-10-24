'use client';

import React from 'react';
import { StakingToken } from '@/types/staking';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface TokenSelectorProps {
  tokens: StakingToken[];
  selectedToken: StakingToken | null;
  onTokenSelect: (token: StakingToken) => void;
}

export function TokenSelector({ tokens, selectedToken, onTokenSelect }: TokenSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Token</label>
      <div className="grid grid-cols-1 gap-2">
        {tokens.map((token) => (
          <Button
            key={token.symbol}
            variant={selectedToken?.symbol === token.symbol ? "default" : "outline"}
            className="justify-between h-12"
            onClick={() => onTokenSelect(token)}
          >
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-blue-600">
                  {token.symbol}
                </span>
              </div>
              <div className="text-left">
                <div className="font-medium">{token.name}</div>
                <div className="text-xs text-gray-500">{token.symbol}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-green-600">{token.apy}% APY</div>
              <div className="text-xs text-gray-500">
                {token.totalStaked.toLocaleString()} staked
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
