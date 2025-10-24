'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  TrendingUp, 
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Reward } from '@/types/staking';

interface RewardsSummaryProps {
  rewards: Reward[];
  onClaimIndividual: (tokenSymbol: string) => void;
  isClaiming: boolean;
}

export function RewardsSummary({ rewards, onClaimIndividual, isClaiming }: RewardsSummaryProps) {
  const totalPendingRewards = rewards.reduce((sum, reward) => sum + reward.pendingAmount, 0);
  const totalClaimedRewards = rewards.reduce((sum, reward) => sum + reward.amount, 0);

  return (
    <div className="space-y-6">
      {/* Rewards Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Pending Rewards</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {totalPendingRewards.toFixed(4)} SOL
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Claimed Rewards</span>
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {totalClaimedRewards.toFixed(4)} SOL
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {totalPendingRewards.toFixed(4)}
                </div>
                <p className="text-sm text-gray-500">SOL Ready to Claim</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Token Rewards */}
      <Card>
        <CardHeader>
          <CardTitle>Token Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          {rewards.length === 0 ? (
            <div className="text-center py-8">
              <Coins className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Rewards Yet</h3>
              <p className="text-gray-500">Start staking to earn rewards</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rewards.map((reward) => (
                <div key={reward.token.symbol} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {reward.token.symbol}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{reward.token.name}</h4>
                      <p className="text-sm text-gray-500">
                        APY: {reward.token.apy}%
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="font-medium">
                        {reward.amount.toFixed(4)} {reward.token.symbol}
                      </div>
                      <div className="text-sm text-gray-500">
                        Claimed
                      </div>
                    </div>
                    
                    {reward.pendingAmount > 0 && (
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          +{reward.pendingAmount.toFixed(4)} {reward.token.symbol}
                        </div>
                        <div className="text-sm text-gray-500">
                          Pending
                        </div>
                      </div>
                    )}
                    
                    <Button
                      onClick={() => onClaimIndividual(reward.token.symbol)}
                      disabled={reward.pendingAmount === 0 || isClaiming}
                      size="sm"
                    >
                      <Coins className="h-4 w-4 mr-2" />
                      Claim
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewards Calculator */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {totalPendingRewards > 0 ? (totalPendingRewards * 0.1).toFixed(4) : '0.0000'}
              </div>
              <p className="text-sm text-gray-500">Daily Estimate</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {totalPendingRewards > 0 ? (totalPendingRewards * 0.7).toFixed(4) : '0.0000'}
              </div>
              <p className="text-sm text-gray-500">Weekly Estimate</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {totalPendingRewards > 0 ? (totalPendingRewards * 3).toFixed(4) : '0.0000'}
              </div>
              <p className="text-sm text-gray-500">Monthly Estimate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
