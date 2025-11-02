'use client';

import React from 'react';
import { StakingPosition } from '@/types/staking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  Unlock, 
  Coins,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

interface PositionCardProps {
  position: StakingPosition;
  onUnstake: (positionId: string) => void;
}

export function PositionCard({ position, onUnstake }: PositionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'unlocking': return 'bg-yellow-100 text-yellow-800';
      case 'unlocked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="h-4 w-4" />;
      case 'unlocking': return <Clock className="h-4 w-4" />;
      case 'unlocked': return <Unlock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysStaked = () => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - position.stakedAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUnlockDate = () => {
    if (!position.lockPeriod) return null;
    const unlockDate = new Date(position.stakedAt);
    unlockDate.setDate(unlockDate.getDate() + position.lockPeriod);
    return unlockDate;
  };

  const isUnlockable = () => {
    if (!position.lockPeriod) return true;
    const unlockDate = getUnlockDate();
    return unlockDate && new Date() >= unlockDate;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {position.token.symbol}
              </span>
            </div>
            <div>
              <h3 className="font-medium">{position.token.name}</h3>
              <p className="text-sm text-gray-500">
                {position.amount} {position.token.symbol}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(position.status)}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(position.status)}
              <span className="capitalize">{position.status}</span>
            </div>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">APY</p>
            <p className="font-medium text-green-600">{position.apy}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rewards Earned</p>
            <p className="font-medium">{position.rewards.toFixed(4)} {position.token.symbol}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Days Staked</p>
            <p className="font-medium">{getDaysStaked()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Staked Since</p>
            <p className="font-medium">{formatDate(position.stakedAt)}</p>
          </div>
        </div>

        {position.lockPeriod && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Lock Period</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {position.lockPeriod} days
              </span>
              {getUnlockDate() && (
                <span className="text-sm text-gray-600">
                  Unlocks: {formatDate(getUnlockDate()!)}
                </span>
              )}
            </div>
            {position.lockPeriod && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(100, (getDaysStaked() / position.lockPeriod) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            disabled={position.status === 'unlocking'}
          >
            <Coins className="h-4 w-4 mr-2" />
            Claim Rewards
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex-1"
            onClick={() => onUnstake(position.id)}
            disabled={position.status === 'unlocking' || (!!position.lockPeriod && !isUnlockable())}
          >
            <Unlock className="h-4 w-4 mr-2" />
            {position.status === 'unlocking' ? 'Unlocking...' : 'Unstake'}
          </Button>
        </div>

        {position.lockPeriod && !isUnlockable() && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Position is locked until {formatDate(getUnlockDate()!)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
