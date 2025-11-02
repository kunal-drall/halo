'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Coins } from 'lucide-react';
import { Reward } from '@/types/staking';

interface RewardsHistoryProps {
  rewards: Reward[];
}

export function RewardsHistory({ rewards }: RewardsHistoryProps) {
  // Mock transaction history
  const mockHistory = [
    {
      id: '1',
      type: 'claim',
      token: 'SOL',
      amount: 0.5,
      timestamp: new Date('2024-01-20'),
      status: 'confirmed'
    },
    {
      id: '2',
      type: 'claim',
      token: 'SOL',
      amount: 0.3,
      timestamp: new Date('2024-01-15'),
      status: 'confirmed'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rewards History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockHistory.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Coins className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">Claimed Rewards</h4>
                  <p className="text-sm text-gray-500">
                    {tx.amount} {tx.token}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {tx.status}
                </Badge>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {tx.timestamp.toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {tx.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
