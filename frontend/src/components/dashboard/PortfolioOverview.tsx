'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Wallet, 
  Coins, 
  Activity,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { PortfolioStats, StakingPosition, Reward } from '@/types/staking';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PortfolioOverviewProps {
  stats: PortfolioStats | null;
  positions: StakingPosition[];
  rewards: Reward[];
}

const mockChartData = [
  { date: '2024-01-01', value: 1000, rewards: 0 },
  { date: '2024-01-02', value: 1025, rewards: 25 },
  { date: '2024-01-03', value: 1050, rewards: 50 },
  { date: '2024-01-04', value: 1075, rewards: 75 },
  { date: '2024-01-05', value: 1100, rewards: 100 },
  { date: '2024-01-06', value: 1125, rewards: 125 },
  { date: '2024-01-07', value: 1150, rewards: 150 },
];

export function PortfolioOverview({ stats, positions, rewards }: PortfolioOverviewProps) {
  const totalPendingRewards = rewards.reduce((sum, reward) => sum + reward.pendingAmount, 0);
  const totalClaimedRewards = rewards.reduce((sum, reward) => sum + reward.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value Locked</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalValueLocked.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRewards.toFixed(2) || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stakes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeStakes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across {positions.length} tokens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageAPY.toFixed(1) || '0.0'}%</div>
            <p className="text-xs text-muted-foreground">
              +0.5% from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Value Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rewards Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="rewards" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Staking Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {positions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Positions</h3>
                <p className="text-gray-500 mb-4">Start staking to earn rewards</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Staking
                </Button>
              </div>
            ) : (
              positions.map((position) => (
                <div key={position.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {position.token.symbol}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{position.token.name}</h4>
                      <p className="text-sm text-gray-500">
                        {position.amount} {position.token.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm font-medium">{position.apy}% APY</p>
                      <p className="text-xs text-gray-500">
                        {position.rewards.toFixed(4)} {position.token.symbol} earned
                      </p>
                    </div>
                    <Badge variant={position.status === 'active' ? 'default' : 'secondary'}>
                      {position.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Plus className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-medium mb-1">Stake Tokens</h3>
            <p className="text-sm text-gray-500">Start earning rewards</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Coins className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-medium mb-1">Claim Rewards</h3>
            <p className="text-sm text-gray-500">
              {totalPendingRewards > 0 ? `${totalPendingRewards.toFixed(4)} pending` : 'No pending rewards'}
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium mb-1">View Analytics</h3>
            <p className="text-sm text-gray-500">Track your performance</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
