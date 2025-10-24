'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  ArrowUpRight,
  Download,
  RefreshCw,
  Settings
} from 'lucide-react';
import { Reward } from '@/types/staking';
import { RewardsSummary } from './RewardsSummary';
import { RewardsHistory } from './RewardsHistory';
import { AutoCompoundSettings } from './AutoCompoundSettings';

interface RewardsCenterProps {
  rewards: Reward[];
  onRewardsUpdate: (rewards: Reward[]) => void;
}

export function RewardsCenter({ rewards, onRewardsUpdate }: RewardsCenterProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isAutoCompoundEnabled, setIsAutoCompoundEnabled] = useState(false);

  const totalPendingRewards = rewards.reduce((sum, reward) => sum + reward.pendingAmount, 0);
  const totalClaimedRewards = rewards.reduce((sum, reward) => sum + reward.amount, 0);
  const totalRewards = totalPendingRewards + totalClaimedRewards;

  const handleClaimAll = async () => {
    setIsClaiming(true);
    
    // Simulate claiming all rewards
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const updatedRewards = rewards.map(reward => ({
      ...reward,
      amount: reward.amount + reward.pendingAmount,
      pendingAmount: 0,
      lastClaimed: new Date()
    }));
    
    onRewardsUpdate(updatedRewards);
    setIsClaiming(false);
  };

  const handleClaimIndividual = async (tokenSymbol: string) => {
    setIsClaiming(true);
    
    // Simulate claiming individual reward
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedRewards = rewards.map(reward => 
      reward.token.symbol === tokenSymbol
        ? {
            ...reward,
            amount: reward.amount + reward.pendingAmount,
            pendingAmount: 0,
            lastClaimed: new Date()
          }
        : reward
    );
    
    onRewardsUpdate(updatedRewards);
    setIsClaiming(false);
  };

  const handleToggleAutoCompound = () => {
    setIsAutoCompoundEnabled(!isAutoCompoundEnabled);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewards.toFixed(4)} SOL</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalPendingRewards.toFixed(4)} SOL</div>
            <p className="text-xs text-muted-foreground">Ready to claim</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Claimed Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClaimedRewards.toFixed(4)} SOL</div>
            <p className="text-xs text-muted-foreground">Already claimed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={handleClaimAll}
          disabled={totalPendingRewards === 0 || isClaiming}
          className="flex-1 min-w-[200px]"
        >
          <Coins className="h-4 w-4 mr-2" />
          {isClaiming ? 'Claiming...' : 'Claim All Rewards'}
        </Button>
        
        <Button 
          variant="outline"
          onClick={handleToggleAutoCompound}
          className={isAutoCompoundEnabled ? 'bg-green-50 border-green-200' : ''}
        >
          <Settings className="h-4 w-4 mr-2" />
          {isAutoCompoundEnabled ? 'Auto-Compound On' : 'Auto-Compound Off'}
        </Button>
        
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export History
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <RewardsSummary 
            rewards={rewards}
            onClaimIndividual={handleClaimIndividual}
            isClaiming={isClaiming}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <RewardsHistory rewards={rewards} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <AutoCompoundSettings 
            isEnabled={isAutoCompoundEnabled}
            onToggle={handleToggleAutoCompound}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
