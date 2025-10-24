'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrustTier } from '@/types/circles';
import { Shield, Star } from 'lucide-react';

interface TrustScoreWidgetProps {
  score?: number;
  tier?: TrustTier;
  publicKey?: any;
}

export function TrustScoreWidget({ score = 650, tier = TrustTier.Silver }: TrustScoreWidgetProps) {
  const getTierColor = (tier: TrustTier) => {
    switch (tier) {
      case TrustTier.Platinum: return 'bg-purple-100 text-purple-800 border-purple-200';
      case TrustTier.Gold: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TrustTier.Silver: return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierName = (tier: TrustTier) => {
    switch (tier) {
      case TrustTier.Platinum: return 'Platinum';
      case TrustTier.Gold: return 'Gold';
      case TrustTier.Silver: return 'Silver';
      default: return 'Newcomer';
    }
  };

  const getTierIcon = (tier: TrustTier) => {
    switch (tier) {
      case TrustTier.Platinum: return '💎';
      case TrustTier.Gold: return '🥇';
      case TrustTier.Silver: return '🥈';
      default: return '🆕';
    }
  };

  const getProgressToNextTier = (score: number, tier: TrustTier) => {
    switch (tier) {
      case TrustTier.Newcomer:
        return { current: score, target: 250, nextTier: 'Silver' };
      case TrustTier.Silver:
        return { current: score - 250, target: 250, nextTier: 'Gold' };
      case TrustTier.Gold:
        return { current: score - 500, target: 250, nextTier: 'Platinum' };
      default:
        return { current: 100, target: 100, nextTier: 'Max' };
    }
  };

  const progress = getProgressToNextTier(score, tier);
  const progressPercentage = Math.min(100, (progress.current / progress.target) * 100);

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-1">
        <Shield className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">{score}</span>
      </div>
      
      <Badge className={`${getTierColor(tier)} border`}>
        <div className="flex items-center space-x-1">
          <span className="text-xs">{getTierIcon(tier)}</span>
          <span className="text-xs font-medium">{getTierName(tier)}</span>
        </div>
      </Badge>

      {tier < TrustTier.Platinum && (
        <div className="flex items-center space-x-1">
          <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      )}
    </div>
  );
}
