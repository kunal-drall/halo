'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletWrapper } from '@/components/WalletWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  History,
  Settings
} from 'lucide-react';
import { UserStats } from '@/types/circles';
import { circleService } from '@/services/circle-service';

interface WalletBalance {
  usdc: number;
  sol: number;
  totalValue: number;
}

interface Transaction {
  id: string;
  type: 'contribution' | 'payout' | 'insurance' | 'yield';
  amount: number;
  circleName: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
}

export default function WalletPage() {
  const { connected, publicKey } = useWallet();
  const [balance, setBalance] = useState<WalletBalance>({ usdc: 0, sol: 0, totalValue: 0 });
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Load wallet data
  useEffect(() => {
    const loadWalletData = async () => {
      if (connected && publicKey) {
        try {
          setLoading(true);
          
          // Load user stats
          const stats = await circleService.getUserStats(publicKey);
          setUserStats(stats);

          // Mock balance data (in real app, would fetch from RPC)
          setBalance({
            usdc: 1250.75,
            sol: 2.5,
            totalValue: 1250.75 + (2.5 * 100), // Assuming SOL = $100
          });

          // Mock transaction history
          setRecentTransactions([
            {
              id: '1',
              type: 'contribution',
              amount: 200,
              circleName: 'Tech Professionals',
              timestamp: Date.now() - 86400000, // 1 day ago
              status: 'completed'
            },
            {
              id: '2',
              type: 'payout',
              amount: 1800,
              circleName: 'Community Builders',
              timestamp: Date.now() - 172800000, // 2 days ago
              status: 'completed'
            },
            {
              id: '3',
              type: 'yield',
              amount: 45.32,
              circleName: 'Crypto Enthusiasts',
              timestamp: Date.now() - 259200000, // 3 days ago
              status: 'completed'
            },
            {
              id: '4',
              type: 'insurance',
              amount: 30,
              circleName: 'Students Circle',
              timestamp: Date.now() - 345600000, // 4 days ago
              status: 'completed'
            }
          ]);
        } catch (error) {
          console.error('Error loading wallet data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadWalletData();
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your Solana wallet to view your balance and transactions
            </p>
            <WalletWrapper />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contribution': return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      case 'payout': return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'yield': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'insurance': return <Shield className="h-4 w-4 text-purple-500" />;
      default: return <DollarSign className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'contribution': return 'text-red-600';
      case 'payout': return 'text-green-600';
      case 'yield': return 'text-blue-600';
      case 'insurance': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Wallet</h1>
              <p className="text-sm text-gray-500">
                {publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <WalletWrapper />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Total Balance</h2>
                <p className="text-blue-100">All assets</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-200" />
            </div>
            <div className="text-3xl font-bold mb-4">
              ${balance.totalValue.toFixed(2)}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-blue-100">USDC</div>
                <div className="font-semibold">${balance.usdc.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-blue-100">SOL</div>
                <div className="font-semibold">{balance.sol.toFixed(2)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-12">
            <Plus className="h-4 w-4 mr-2" />
            Add Funds
          </Button>
          <Button variant="outline" className="h-12">
            <History className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>

        {/* Stats Overview */}
        {userStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userStats.circlesJoined}
                  </div>
                  <div className="text-sm text-gray-500">Circles Joined</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userStats.circlesCompleted}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    ${userStats.totalContributions.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Contributed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    ${userStats.totalPayouts.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Received</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <History className="h-5 w-5 mr-2" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Transactions Yet</h3>
                <p className="text-gray-500 mb-4">
                  Your transaction history will appear here
                </p>
                <Button variant="outline">
                  View All Transactions
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <div className="font-medium text-gray-900 capitalize">
                          {tx.type}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tx.circleName}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${getTransactionColor(tx.type)}`}>
                        {tx.type === 'contribution' ? '-' : '+'}${tx.amount.toFixed(2)}
                      </div>
                      <Badge className={getStatusColor(tx.status)}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insurance Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Insurance Stakes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium">Tech Professionals</div>
                    <div className="text-sm text-gray-500">$30.00 staked</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">Community Builders</div>
                    <div className="text-sm text-gray-500">$25.00 staked</div>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
