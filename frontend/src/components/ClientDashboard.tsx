'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
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
  Wallet,
  Star,
  Calendar,
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { Circle, PaymentDue, PayoutReady, UserStats } from '@/types/circles';
import { CircleCard } from '@/components/circles/CircleCard';
import { useCircleStore } from '@/stores/circleStore';
import { useTrustStore } from '@/stores/trustStore';
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

  // Calculate summary stats
  const totalBalance = myCircles.reduce((sum, c) => sum + (c.contributionAmount * c.currentRound), 0);
  const nextPayment = paymentDue[0];
  const payoutPosition = myCircles.length > 0 ? myCircles[0].currentRound : 0;
  const consecutiveOnTime = userStats?.circlesCompleted || 0;

  // Show wallet connection prompt
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-secondary/10">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to Halo</h2>
            <p className="text-muted-foreground mb-6">
              Join trusted savings circles and build your financial future
            </p>
            <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !w-full !justify-center" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your circles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Trust Score Banner */}
      {consecutiveOnTime > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-3">
          <div className="max-w-lg mx-auto flex items-center justify-center gap-2 text-sm font-medium">
            <Trophy className="h-4 w-4" />
            <span>You've contributed on time {consecutiveOnTime} months in a row — Trust Score +{consecutiveOnTime * 2}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Circles you belong to</h1>
            </div>
            <WalletMultiButton className="!bg-primary/10 !text-primary hover:!bg-primary/20 !text-sm !py-2 !px-3 !rounded-lg" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Balance Card */}
          <Card className="col-span-2 bg-gradient-to-br from-primary to-primary/80 text-white border-0">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-sm font-medium">Balance in Circles</p>
                  <p className="text-3xl font-bold">${totalBalance.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Contribution */}
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-600">Next Contribution</span>
              </div>
              {nextPayment ? (
                <>
                  <p className="text-xl font-bold text-orange-900">
                    {nextPayment.daysUntilDue > 0
                      ? `${nextPayment.daysUntilDue} days`
                      : 'Due today!'
                    }
                  </p>
                  <p className="text-sm text-orange-700">${nextPayment.amount}</p>
                </>
              ) : (
                <p className="text-sm text-orange-700">No payments due</p>
              )}
            </CardContent>
          </Card>

          {/* Payout Position */}
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-600">Your Position</span>
              </div>
              <p className="text-xl font-bold text-purple-900">
                Month {payoutPosition + 1}
              </p>
              <p className="text-sm text-purple-700">Payout order</p>
            </CardContent>
          </Card>
        </div>

        {/* Trust Score Widget */}
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <Link href="/trust-score" className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Trust Score</p>
                  <p className="text-sm text-muted-foreground">
                    {tier === 0 ? 'Newcomer' : tier === 1 ? 'Silver' : tier === 2 ? 'Gold' : 'Platinum'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">{userScore?.overallScore ?? 0}</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button asChild className="h-12 bg-primary hover:bg-primary/90">
            <Link href="/circles">
              <Plus className="h-4 w-4 mr-2" />
              Join a Circle
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 border-primary text-primary hover:bg-primary/5">
            <Link href="/circles/create">
              <Users className="h-4 w-4 mr-2" />
              Create Circle
            </Link>
          </Button>
        </div>

        {/* Payout Ready Alert */}
        {payoutReady.length > 0 && (
          <Card className="border-green-300 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Payout Ready!</p>
                    <p className="text-sm text-green-600">
                      ${payoutReady[0].totalPayout?.toFixed(2)} available
                    </p>
                  </div>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Claim
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Due Alert */}
        {nextPayment && nextPayment.daysUntilDue <= 3 && (
          <Card className={`${nextPayment.isOverdue ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full ${nextPayment.isOverdue ? 'bg-red-500' : 'bg-amber-500'} flex items-center justify-center`}>
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className={`font-semibold ${nextPayment.isOverdue ? 'text-red-800' : 'text-amber-800'}`}>
                      {nextPayment.isOverdue ? 'Payment Overdue!' : 'Payment Due Soon'}
                    </p>
                    <p className={`text-sm ${nextPayment.isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                      {nextPayment.circleName} - ${nextPayment.amount}
                    </p>
                  </div>
                </div>
                <Button size="sm" className={nextPayment.isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}>
                  Pay Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Circles */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-primary" />
            Your Circles
          </h2>

          {myCircles.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No Circles Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Join your first savings circle to start building your financial future
                </p>
                <Button asChild className="w-full">
                  <Link href="/circles">
                    Discover Circles
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
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

        {/* Yield Info */}
        <Card className="border-primary/10 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Earning Yield</p>
                <p className="text-xs text-muted-foreground">
                  Your idle funds earn ~5% APY automatically
                </p>
              </div>
              <Badge variant="secondary" className="text-xs">
                ~5% APY
              </Badge>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
