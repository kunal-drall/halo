'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletWrapper } from '@/components/WalletWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft,
  Users, 
  DollarSign, 
  Clock, 
  Shield,
  TrendingUp,
  Star,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Activity,
  Settings
} from 'lucide-react';
import { Circle, Member } from '@/types/circles';
import { circleService } from '@/services/circle-service';
import { useToast } from '@/components/ui/toast';
import { useParams } from 'next/navigation';

interface CircleDetailProps {
  params: {
    id: string;
  };
}

export default function CircleDetailPage({ params }: CircleDetailProps) {
  const { connected, publicKey } = useWallet();
  const { addToast } = useToast();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isContributing, setIsContributing] = useState(false);

  // Load circle data
  useEffect(() => {
    const loadCircleData = async () => {
      try {
        setLoading(true);
        
        // Load circle details
        const circleData = await circleService.getCircle(params.id);
        setCircle(circleData);

        // Mock members data
        setMembers([
          {
            authority: 'Member1...',
            circle: params.id,
            stakeAmount: 30,
            contributionHistory: [200, 200, 200],
            payoutClaimed: false,
            payoutPosition: 1,
            insuranceStaked: 30,
            trustScore: 750,
            trustTier: 3,
            contributionRecords: [],
            status: 'Active',
            hasReceivedPot: false,
            penalties: 0,
            joinedAt: Date.now() - 86400000 * 30,
            contributionsMissed: 0
          },
          {
            authority: 'Member2...',
            circle: params.id,
            stakeAmount: 25,
            contributionHistory: [200, 200],
            payoutClaimed: false,
            payoutPosition: 2,
            insuranceStaked: 25,
            trustScore: 650,
            trustTier: 1,
            contributionRecords: [],
            status: 'Active',
            hasReceivedPot: false,
            penalties: 0,
            joinedAt: Date.now() - 86400000 * 20,
            contributionsMissed: 0
          }
        ]);
      } catch (error) {
        console.error('Error loading circle data:', error);
        addToast({
          type: 'error',
          title: 'Error',
          description: 'Failed to load circle details',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    loadCircleData();
  }, [params.id, addToast]);

  const handleContribute = async () => {
    if (!publicKey || !circle) return;

    setIsContributing(true);
    try {
      const signature = await circleService.contribute(
        { circleId: circle.id, amount: circle.contributionAmount },
        publicKey
      );

      addToast({
        type: 'success',
        title: 'Contribution Successful',
        description: `Contributed $${circle.contributionAmount} to ${circle.id.slice(0, 8)}`,
        duration: 5000
      });

      // Refresh circle data
      window.location.reload();
    } catch (error) {
      console.error('Error making contribution:', error);
      addToast({
        type: 'error',
        title: 'Contribution Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        duration: 7000
      });
    } finally {
      setIsContributing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Forming': return 'bg-blue-100 text-blue-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-purple-100 text-purple-800';
      case 'Terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrustTierName = (tier: number) => {
    switch (tier) {
      case 3: return 'Platinum';
      case 2: return 'Gold';
      case 1: return 'Silver';
      default: return 'Newcomer';
    }
  };

  const getTrustTierColor = (tier: number) => {
    switch (tier) {
      case 3: return 'text-purple-600';
      case 2: return 'text-yellow-600';
      case 1: return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your Solana wallet to view circle details
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

  if (!circle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Circle Not Found</h2>
            <p className="text-gray-600 mb-6">
              The circle you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isUserMember = publicKey && circle.members.includes(publicKey.toBase58());
  const isUserTurn = circle.nextPayoutRecipient === publicKey?.toBase58();
  const progressPercentage = (circle.currentRound / circle.durationMonths) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Circle {circle.id.slice(0, 8)}
                </h1>
                <p className="text-sm text-gray-500">
                  {circle.currentMembers}/{circle.maxMembers} members
                </p>
              </div>
            </div>
            <WalletWrapper />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Circle Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Circle Status</span>
              </div>
              <Badge className={getStatusColor(circle.status)}>
                {circle.status}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Round {circle.currentRound} of {circle.durationMonths}</span>
                <span>{Math.round(progressPercentage)}% complete</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  ${circle.contributionAmount}
                </div>
                <div className="text-sm text-gray-500">Monthly Contribution</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ${circle.totalPot.toFixed(0)}
                </div>
                <div className="text-sm text-gray-500">Total Pot</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Status Indicators */}
        {isUserTurn && (
          <Card className="border-l-4 border-l-green-500 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">
                  It's your turn to receive payout!
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Members ({circle.currentMembers})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={member.authority} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.authority.slice(0, 8)}...{member.authority.slice(-8)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Position #{member.payoutPosition}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${getTrustTierColor(member.trustTier)}`}>
                      {getTrustTierName(member.trustTier)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {member.trustScore} pts
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Circle Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Circle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Payout Method</div>
                <div className="font-semibold">{circle.payoutMethod}</div>
              </div>
              <div>
                <div className="text-gray-500">Min Trust Tier</div>
                <div className="font-semibold">{getTrustTierName(circle.minTrustTier)}</div>
              </div>
              <div>
                <div className="text-gray-500">Penalty Rate</div>
                <div className="font-semibold">{circle.penaltyRate}%</div>
              </div>
              <div>
                <div className="text-gray-500">Yield Earned</div>
                <div className="font-semibold text-green-600">
                  ${circle.totalYieldEarned.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isUserMember ? (
          <div className="space-y-3">
            {isUserTurn ? (
              <Button 
                className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
                onClick={() => {
                  // Handle payout claim
                  addToast({
                    type: 'info',
                    title: 'Claim Payout',
                    description: 'Payout claiming functionality will be implemented',
                    duration: 5000
                  });
                }}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Claim Payout
              </Button>
            ) : (
              <Button 
                onClick={handleContribute}
                disabled={isContributing}
                className="w-full h-12 text-lg font-semibold"
              >
                {isContributing ? 'Processing...' : `Contribute $${circle.contributionAmount}`}
              </Button>
            )}
            
            <Button variant="outline" className="w-full">
              <Activity className="h-4 w-4 mr-2" />
              View Activity
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button className="w-full h-12 text-lg font-semibold">
              <Users className="h-5 w-5 mr-2" />
              Join Circle
            </Button>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Circle Settings
            </Button>
          </div>
        )}

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: circle.durationMonths }, (_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold
                    ${i < circle.currentRound 
                      ? 'bg-green-500 text-white' 
                      : i === circle.currentRound 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">
                      Round {i + 1}
                      {i === circle.currentRound && ' (Current)'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {i < circle.currentRound ? 'Completed' : 
                       i === circle.currentRound ? 'In Progress' : 'Upcoming'}
                    </div>
                  </div>
                  {i < circle.currentRound && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
