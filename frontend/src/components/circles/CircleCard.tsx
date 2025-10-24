'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Circle } from '@/types/circles';
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp,
  ArrowRight,
  Shield,
  Star
} from 'lucide-react';

interface CircleCardProps {
  circle: Circle;
}

export function CircleCard({ circle }: CircleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Forming': return 'bg-blue-100 text-blue-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-purple-100 text-purple-800';
      case 'Terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrustTierColor = (tier: number) => {
    if (tier >= 3) return 'text-purple-600';
    if (tier >= 2) return 'text-yellow-600';
    if (tier >= 1) return 'text-blue-600';
    return 'text-gray-600';
  };

  const getTrustTierName = (tier: number) => {
    switch (tier) {
      case 3: return 'Platinum';
      case 2: return 'Gold';
      case 1: return 'Silver';
      default: return 'Newcomer';
    }
  };

  const getPayoutMethodText = (method: string) => {
    switch (method) {
      case 'FixedRotation': return 'Fixed Order';
      case 'Auction': return 'Auction';
      case 'Random': return 'Random';
      default: return 'Fixed Order';
    }
  };

  const isUserTurn = circle.nextPayoutRecipient && circle.status === 'Active';
  const progressPercentage = (circle.currentRound / circle.durationMonths) * 100;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Circle {circle.id.slice(0, 8)}
            </h3>
            <p className="text-sm text-gray-500">
              {getPayoutMethodText(circle.payoutMethod)} • {circle.durationMonths} months
            </p>
          </div>
          <Badge className={getStatusColor(circle.status)}>
            {circle.status}
          </Badge>
        </div>

        {/* Progress Bar */}
        {circle.status === 'Active' && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Round {circle.currentRound} of {circle.durationMonths}</span>
              <span>{Math.round(progressPercentage)}% complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-sm text-gray-500">Contribution</div>
              <div className="font-semibold">${circle.contributionAmount}</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm text-gray-500">Members</div>
              <div className="font-semibold">{circle.currentMembers}/{circle.maxMembers}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm text-gray-500">Min Trust</div>
              <div className={`font-semibold ${getTrustTierColor(circle.minTrustTier)}`}>
                {getTrustTierName(circle.minTrustTier)}
              </div>
            </div>
          </div>

          {circle.totalYieldEarned > 0 && (
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-sm text-gray-500">Yield Earned</div>
                <div className="font-semibold text-green-600">
                  ${circle.totalYieldEarned.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Special Status Indicators */}
        {isUserTurn && (
          <div className="mb-3 p-2 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                It's your turn to receive payout!
              </span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            disabled={circle.status !== 'Active'}
          >
            <Clock className="h-4 w-4 mr-1" />
            View Details
          </Button>
          <Button 
            size="sm" 
            className="flex-1"
            disabled={circle.status !== 'Active'}
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            {isUserTurn ? 'Claim' : 'Contribute'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

