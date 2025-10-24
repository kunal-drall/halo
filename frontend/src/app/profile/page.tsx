'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletWrapper } from '@/components/WalletWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Shield, 
  Star, 
  TrendingUp, 
  Award,
  CheckCircle,
  Clock,
  AlertTriangle,
  Settings,
  Target,
  BarChart3
} from 'lucide-react';
import { TrustTier, UserStats } from '@/types/circles';
import { circleService } from '@/services/circle-service';

interface TrustScoreBreakdown {
  paymentReliability: number;
  circlesCompleted: number;
  circlesDefaulted: number;
  totalContributions: number;
  onTimePayments: number;
  latePayments: number;
  overallScore: number;
  tier: TrustTier;
}

export default function ProfilePage() {
  const { connected, publicKey } = useWallet();
  const [trustScore, setTrustScore] = useState<TrustScoreBreakdown | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Load profile data
  useEffect(() => {
    const loadProfileData = async () => {
      if (connected && publicKey) {
        try {
          setLoading(true);
          
          // Load user stats
          const stats = await circleService.getUserStats(publicKey);
          setUserStats(stats);

          // Mock trust score data
          setTrustScore({
            paymentReliability: 95,
            circlesCompleted: 2,
            circlesDefaulted: 0,
            totalContributions: 8,
            onTimePayments: 7,
            latePayments: 1,
            overallScore: 650,
            tier: TrustTier.Silver
          });
        } catch (error) {
          console.error('Error loading profile data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfileData();
  }, [connected, publicKey]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <User className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your Solana wallet to view your profile and trust score
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

  const getTierInfo = (tier: TrustTier) => {
    switch (tier) {
      case TrustTier.Platinum:
        return { name: 'Platinum', color: 'bg-purple-100 text-purple-800', icon: '💎', min: 750, max: 1000 };
      case TrustTier.Gold:
        return { name: 'Gold', color: 'bg-yellow-100 text-yellow-800', icon: '🥇', min: 500, max: 749 };
      case TrustTier.Silver:
        return { name: 'Silver', color: 'bg-blue-100 text-blue-800', icon: '🥈', min: 250, max: 499 };
      default:
        return { name: 'Newcomer', color: 'bg-gray-100 text-gray-800', icon: '🆕', min: 0, max: 249 };
    }
  };

  const getNextTierInfo = (currentTier: TrustTier) => {
    switch (currentTier) {
      case TrustTier.Newcomer:
        return { name: 'Silver', target: 250, progress: (trustScore?.overallScore || 0) / 250 * 100 };
      case TrustTier.Silver:
        return { name: 'Gold', target: 500, progress: ((trustScore?.overallScore || 0) - 250) / 250 * 100 };
      case TrustTier.Gold:
        return { name: 'Platinum', target: 750, progress: ((trustScore?.overallScore || 0) - 500) / 250 * 100 };
      default:
        return { name: 'Max', target: 1000, progress: 100 };
    }
  };

  const tierInfo = trustScore ? getTierInfo(trustScore.tier) : null;
  const nextTierInfo = trustScore ? getNextTierInfo(trustScore.tier) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Profile</h1>
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
        {/* Trust Score Card */}
        {trustScore && (
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="text-6xl font-bold mb-2">
                  {trustScore.overallScore}
                </div>
                <div className="text-blue-100">Trust Score</div>
              </div>
              
              <Badge className={`${tierInfo?.color} text-lg px-4 py-2 mb-4`}>
                <span className="mr-2">{tierInfo?.icon}</span>
                {tierInfo?.name}
              </Badge>

              {nextTierInfo && nextTierInfo.name !== 'Max' && (
                <div className="mt-4">
                  <div className="text-sm text-blue-100 mb-2">
                    Progress to {nextTierInfo.name}
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-white h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, nextTierInfo.progress)}%` }}
                    />
                  </div>
                  <div className="text-xs text-blue-100 mt-1">
                    {Math.round(nextTierInfo.progress)}% complete
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Score Breakdown */}
        {trustScore && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Payment Reliability</span>
                  </div>
                  <div className="text-sm font-semibold">{trustScore.paymentReliability}%</div>
                </div>
                <Progress value={trustScore.paymentReliability} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Award className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Circles Completed</span>
                  </div>
                  <div className="text-sm font-semibold">{trustScore.circlesCompleted}</div>
                </div>
                <Progress value={(trustScore.circlesCompleted / 5) * 100} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Defaults</span>
                  </div>
                  <div className="text-sm font-semibold">{trustScore.circlesDefaulted}</div>
                </div>
                <Progress value={trustScore.circlesDefaulted > 0 ? 0 : 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Stats */}
        {userStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {userStats.circlesJoined}
                  </div>
                  <div className="text-sm text-gray-500">Circles Joined</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {userStats.circlesCompleted}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    ${userStats.totalContributions.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Contributed</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    ${userStats.totalPayouts.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Received</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        {trustScore && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">On-Time Payments</div>
                      <div className="text-sm text-gray-500">{trustScore.onTimePayments} payments</div>
                    </div>
                  </div>
                  <div className="text-green-600 font-semibold">
                    {Math.round((trustScore.onTimePayments / trustScore.totalContributions) * 100)}%
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <div className="font-medium">Late Payments</div>
                      <div className="text-sm text-gray-500">{trustScore.latePayments} payments</div>
                    </div>
                  </div>
                  <div className="text-yellow-600 font-semibold">
                    {Math.round((trustScore.latePayments / trustScore.totalContributions) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Improvement Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Improve Your Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <Star className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-900">Make On-Time Payments</div>
                  <div className="text-sm text-blue-700">
                    Pay your contributions on time to maintain high reliability
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <Award className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <div className="font-medium text-green-900">Complete More Circles</div>
                  <div className="text-sm text-green-700">
                    Successfully complete circles to boost your score
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <Shield className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <div className="font-medium text-purple-900">Avoid Defaults</div>
                  <div className="text-sm text-purple-700">
                    Never default on payments to maintain perfect record
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Account Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Privacy & Security
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <User className="h-4 w-4 mr-2" />
              Profile Information
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
