'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletWrapper } from '@/components/WalletWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Plus,
  Wallet
} from 'lucide-react';
import { Circle, PaymentDue, PayoutReady, UserStats } from '@/types/circles';
import { PaymentDueCard } from '@/components/circles/PaymentDueCard';
// PayoutReadyCard component removed - using mock data for now
import { CircleCard } from '@/components/circles/CircleCard';
import { TrustScoreWidget } from '@/components/trust/TrustScoreWidget';
import { useCircleStore } from '@/stores/circleStore';
import { useTrustStore } from '@/stores/trustStore';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { useToast } from '@/components/ui/use-toast';

export function ClientDashboard() {
  const { connected, publicKey } = useWallet();
  const { toast } = useToast();
  
  // Zustand stores
  const {
    myCircles,
    paymentDue,
    payoutReady,
    userStats,
    loading,
    error,
    fetchMyCircles,
    fetchPaymentDue,
    fetchPayoutReady,
    fetchUserStats,
    setError
  } = useCircleStore();

  const {
    userScore,
    tier,
    loading: trustLoading,
    fetchTrustScore
  } = useTrustStore();

  // Mobile gesture hooks
  const swipeGesture = useSwipeGesture({
    onSwipeLeft: () => {
      // Navigate to next page
      console.log('Swipe left');
    },
    onSwipeRight: () => {
      // Navigate to previous page
      console.log('Swipe right');
    }
  });

  const pullToRefresh = usePullToRefresh({
    onRefresh: async () => {
      if (publicKey) {
        await Promise.all([
          fetchMyCircles(publicKey),
          fetchPaymentDue(publicKey),
          fetchPayoutReady(publicKey),
          fetchUserStats(publicKey),
          fetchTrustScore(publicKey)
        ]);
      }
    }
  });
  const { isRefreshing } = pullToRefresh;

  // Load data when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      fetchMyCircles(publicKey);
      fetchPaymentDue(publicKey);
      fetchPayoutReady(publicKey);
      fetchUserStats(publicKey);
      fetchTrustScore(publicKey);
    }
  }, [connected, publicKey, fetchMyCircles, fetchPaymentDue, fetchPayoutReady, fetchUserStats, fetchTrustScore]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      setError(null);
    }
  }, [error, toast, setError]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your circles...</p>
        </div>
      </div>
    );
  }

  // Show wallet connection prompt
  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your Solana wallet to start joining lending circles
            </p>
            <WalletWrapper />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" {...swipeGesture.gestureProps} {...pullToRefresh.gestureProps}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Circles</h1>
              <p className="text-sm text-gray-600">
                {isRefreshing && <span className="ml-2 text-blue-500">Refreshing...</span>}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <TrustScoreWidget publicKey={publicKey} />
              <WalletWrapper />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Payment Due Alerts */}
        {paymentDue.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Payment Due
            </h2>
            {paymentDue.map((payment) => (
              <PaymentDueCard key={payment.circleId} payment={payment} />
            ))}
          </div>
        )}

        {/* Payout Ready Notifications */}
        {payoutReady.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              Payout Ready
            </h2>
            {payoutReady.map((payout) => (
              <Card key={payout.circleId} className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800">Payout Ready!</h3>
                      <p className="text-sm text-green-600">
                        Circle: {payout.circleId}
                      </p>
                      <p className="text-sm text-green-600">
                        Amount: ${(payout.totalPayout || 0).toFixed(2)}
                      </p>
                    </div>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Claim
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* User Stats */}
        {userStats && userStats !== null && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{userStats.circlesJoined || 0}</div>
                  <div className="text-sm text-gray-600">Circles Joined</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${(userStats.totalContributions || 0).toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Contributed</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">${(userStats.totalPayouts || 0).toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Received</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{userStats.circlesCompleted || 0}</div>
                  <div className="text-sm text-gray-600">Circles Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Circles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              My Circles
            </h2>
            <Button size="sm" className="flex items-center">
              <Plus className="h-4 w-4 mr-1" />
              Join Circle
            </Button>
          </div>
          
          {myCircles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No Circles Yet</h3>
                <p className="text-gray-600 mb-4">
                  Join your first lending circle to start building your credit history
                </p>
                <Button className="w-full">
                  Discover Circles
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {myCircles.map((circle) => (
                <CircleCard key={circle.id} circle={circle} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

