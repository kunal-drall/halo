import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { queryOne } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('user') || searchParams.get('address');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

    let userPubkey: PublicKey;
    try {
      userPubkey = new PublicKey(userAddress);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid public key format' },
        { status: 400 }
      );
    }

    const trustScore = await getTrustScoreForUser(userPubkey.toBase58());

    return NextResponse.json({
      success: true,
      data: trustScore,
      trustScore: {
        user: trustScore.user,
        paymentReliability: trustScore.breakdown.paymentHistory.percentage,
        circlesCompleted: trustScore.metadata.circlesCompleted,
        circlesDefaulted: 0,
        totalContributionsMade: trustScore.metadata.totalContributions,
        onTimePayments: Math.floor(trustScore.metadata.totalContributions * 0.9),
        latePayments: trustScore.metadata.missedContributions,
        overallScore: trustScore.score,
        tier: getTierNumber(trustScore.tier),
        lastUpdated: trustScore.metadata.lastUpdated,
      }
    });

  } catch (error) {
    console.error('Error fetching trust score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getTierNumber(tierName: string): number {
  switch (tierName) {
    case 'Platinum': return 3;
    case 'Gold': return 2;
    case 'Silver': return 1;
    default: return 0;
  }
}

function getTierName(tier: number): string {
  switch (tier) {
    case 3: return 'Platinum';
    case 2: return 'Gold';
    case 1: return 'Silver';
    default: return 'Newcomer';
  }
}

function getStakeMultiplier(tier: number): number {
  switch (tier) {
    case 3: return 75;
    case 2: return 100;
    case 1: return 150;
    default: return 200;
  }
}

async function getTrustScoreForUser(pubkey: string) {
  const user = await queryOne<any>(
    'SELECT * FROM users WHERE pubkey = $1',
    [pubkey]
  );
  
  if (user) {
    const score = user.trust_score || 100;
    const tier = user.trust_tier || 0;
    const tierName = getTierName(tier);
    
    const paymentHistoryScore = Math.min(400, Math.floor(score * 0.4));
    const completionScore = Math.min(300, Math.floor(score * 0.3));
    const defiActivityScore = Math.min(200, Math.floor(score * 0.2));
    const socialProofScore = Math.min(100, Math.floor(score * 0.1));
    
    return {
      user: pubkey,
      score,
      tier: tierName,
      stakeMultiplier: getStakeMultiplier(tier),
      breakdown: {
        paymentHistory: {
          score: paymentHistoryScore,
          maxScore: 400,
          weight: 40,
          percentage: Math.round((paymentHistoryScore / 400) * 100)
        },
        circleCompletions: {
          score: completionScore,
          maxScore: 300,
          weight: 30,
          percentage: Math.round((completionScore / 300) * 100)
        },
        defiActivity: {
          score: defiActivityScore,
          maxScore: 200,
          weight: 20,
          percentage: Math.round((defiActivityScore / 200) * 100)
        },
        socialProofs: {
          score: socialProofScore,
          maxScore: 100,
          weight: 10,
          percentage: Math.round((socialProofScore / 100) * 100)
        }
      },
      metadata: {
        circlesCompleted: user.circles_completed || 0,
        circlesJoined: user.circles_completed || 0,
        totalContributions: user.total_contributions || 0,
        missedContributions: user.late_payments || 0,
        socialProofs: [],
        lastUpdated: user.updated_at ? new Date(user.updated_at).getTime() : Date.now()
      }
    };
  }

  const baseScore = 100;
  return {
    user: pubkey,
    score: baseScore,
    tier: 'Newcomer',
    stakeMultiplier: 200,
    breakdown: {
      paymentHistory: {
        score: 40,
        maxScore: 400,
        weight: 40,
        percentage: 10
      },
      circleCompletions: {
        score: 30,
        maxScore: 300,
        weight: 30,
        percentage: 10
      },
      defiActivity: {
        score: 20,
        maxScore: 200,
        weight: 20,
        percentage: 10
      },
      socialProofs: {
        score: 10,
        maxScore: 100,
        weight: 10,
        percentage: 10
      }
    },
    metadata: {
      circlesCompleted: 0,
      circlesJoined: 0,
      totalContributions: 0,
      missedContributions: 0,
      socialProofs: [],
      lastUpdated: Date.now()
    }
  };
}
