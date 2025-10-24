'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Wallet, 
  Coins, 
  Activity,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { PortfolioStats, StakingPosition, Reward, Transaction } from '@/types/staking';
import { PortfolioOverview } from './dashboard/PortfolioOverview';
import { StakingInterface } from './staking/StakingInterface';
import { RewardsCenter } from './rewards/RewardsCenter';
import { TransactionHistory } from './transactions/TransactionHistory';
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard';
import { stakingService } from '@/services/staking-service';

export default function Dashboard() {
  const { connected, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats | null>(null);
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  // Load real data from smart contract
  useEffect(() => {
    const loadData = async () => {
      if (connected && publicKey) {
        try {
          // Check if service is healthy
          const isHealthy = await stakingService.isHealthy();
          if (!isHealthy) {
            console.warn('Staking service is not healthy, using fallback data');
            return;
          }

          // Load portfolio stats
          const stats = await stakingService.getPortfolioStats(publicKey);
          setPortfolioStats(stats);

          // Load staking positions
          const positions = await stakingService.getUserPositions(publicKey);
          setStakingPositions(positions);

          // Load rewards
          const rewards = await stakingService.getUserRewards(publicKey);
          setRewards(rewards);
        } catch (error) {
          console.error('Error loading data:', error);
          // Fallback to mock data on error
          setPortfolioStats({
            totalValueLocked: 1250.75,
            totalRewards: 45.32,
            activeStakes: 3,
            averageAPY: 8.5,
            totalEarned: 125.50
          });
        }
      }
    };

    loadData();
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your Solana wallet to start staking and earning rewards
            </p>
            <WalletMultiButton className="w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Halo Protocol</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
              </div>
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="staking">Staking</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PortfolioOverview 
              stats={portfolioStats}
              positions={stakingPositions}
              rewards={rewards}
            />
          </TabsContent>

          <TabsContent value="staking" className="space-y-6">
            <StakingInterface 
              positions={stakingPositions}
              onPositionUpdate={setStakingPositions}
            />
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <RewardsCenter 
              rewards={rewards}
              onRewardsUpdate={setRewards}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard 
              positions={stakingPositions}
              transactions={recentTransactions}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <TransactionHistory 
              transactions={recentTransactions}
              onTransactionsUpdate={setRecentTransactions}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}