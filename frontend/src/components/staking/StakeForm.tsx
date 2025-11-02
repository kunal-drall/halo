'use client';

import React, { useState } from 'react';
import { StakingToken } from '@/types/staking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Maximize2, Clock } from 'lucide-react';

interface StakeFormProps {
  selectedToken: StakingToken | null;
  amount: string;
  onAmountChange: (amount: string) => void;
  lockPeriod: number | null;
  onLockPeriodChange: (period: number | null) => void;
}

const LOCK_PERIODS = [
  { value: null, label: 'Flexible', description: 'Unstake anytime' },
  { value: 7, label: '7 Days', description: '+0.5% APY bonus' },
  { value: 30, label: '30 Days', description: '+1.0% APY bonus' },
  { value: 90, label: '90 Days', description: '+2.0% APY bonus' },
  { value: 180, label: '180 Days', description: '+3.0% APY bonus' },
];

export function StakeForm({ 
  selectedToken, 
  amount, 
  onAmountChange, 
  lockPeriod, 
  onLockPeriodChange 
}: StakeFormProps) {
  const [walletBalance] = useState(100); // Mock wallet balance

  const handleMaxClick = () => {
    if (selectedToken) {
      onAmountChange(walletBalance.toString());
    }
  };

  const getEffectiveAPY = () => {
    if (!selectedToken) return 0;
    let bonus = 0;
    if (lockPeriod === 7) bonus = 0.5;
    else if (lockPeriod === 30) bonus = 1.0;
    else if (lockPeriod === 90) bonus = 2.0;
    else if (lockPeriod === 180) bonus = 3.0;
    return selectedToken.apy + bonus;
  };

  return (
    <div className="space-y-4">
      {/* Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="amount">Amount to Stake</Label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="pr-20"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={handleMaxClick}
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Max
          </Button>
        </div>
        {selectedToken && (
          <p className="text-xs text-gray-500">
            Balance: {walletBalance} {selectedToken.symbol}
          </p>
        )}
      </div>

      {/* Lock Period Selection */}
      <div className="space-y-2">
        <Label>Lock Period (Optional)</Label>
        <div className="grid grid-cols-1 gap-2">
          {LOCK_PERIODS.map((period) => (
            <Button
              key={period.value || 'flexible'}
              variant={lockPeriod === period.value ? "default" : "outline"}
              className="justify-between h-12"
              onClick={() => onLockPeriodChange(period.value)}
            >
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">{period.label}</div>
                  <div className="text-xs text-gray-500">{period.description}</div>
                </div>
              </div>
              {period.value && (
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    +{period.value === 7 ? '0.5' : period.value === 30 ? '1.0' : period.value === 90 ? '2.0' : '3.0'}% APY
                  </div>
                </div>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {selectedToken && amount && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-2">
          <h4 className="font-medium">Staking Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Token:</span>
              <span className="font-medium">{selectedToken.name} ({selectedToken.symbol})</span>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-medium">{amount} {selectedToken.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span>Lock Period:</span>
              <span className="font-medium">
                {lockPeriod ? `${lockPeriod} days` : 'Flexible'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Base APY:</span>
              <span className="font-medium">{selectedToken.apy}%</span>
            </div>
            {lockPeriod && (
              <div className="flex justify-between">
                <span>Lock Bonus:</span>
                <span className="font-medium text-green-600">
                  +{lockPeriod === 7 ? '0.5' : lockPeriod === 30 ? '1.0' : lockPeriod === 90 ? '2.0' : '3.0'}%
                </span>
              </div>
            )}
            <div className="flex justify-between font-medium border-t pt-2">
              <span>Effective APY:</span>
              <span className="text-green-600">{getEffectiveAPY().toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
