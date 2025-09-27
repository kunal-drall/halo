import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey } from '@solana/web3.js';

/**
 * POST /api/trust-score/batch
 * Get trust score information for multiple users
 * 
 * Request body: { users: string[] }
 * Response: { success: boolean, data: TrustScoreData[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { users } = body;

    if (!users || !Array.isArray(users)) {
      return NextResponse.json(
        { error: 'Users array is required' },
        { status: 400 }
      );
    }

    if (users.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 users allowed per batch request' },
        { status: 400 }
      );
    }

    const trustScores = [];

    for (const userAddress of users) {
      try {
        const userPubkey = new PublicKey(userAddress);
        const trustScore = await getMockTrustScoreData(userPubkey);
        trustScores.push(trustScore);
      } catch (error) {
        // If individual user fails, add error entry
        trustScores.push({
          user: userAddress,
          error: 'Invalid public key or data not found'
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: trustScores,
      count: trustScores.length
    });

  } catch (error) {
    console.error('Error in batch trust score fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Mock function to simulate trust score data
 * In production, this would use the actual HaloProtocolClient
 */
async function getMockTrustScoreData(userPubkey: PublicKey) {
  // Simulate different scores based on user address for demo
  const addressBytes = userPubkey.toBytes();
  const scoreVariation = addressBytes[0] % 100;
  const baseScore = 500 + scoreVariation;

  const paymentHistoryScore = Math.min(400, Math.floor(baseScore * 0.4));
  const completionScore = Math.min(300, Math.floor(baseScore * 0.3));
  const defiActivityScore = Math.min(200, Math.floor(baseScore * 0.2));
  const socialProofScore = Math.min(100, Math.floor(baseScore * 0.1));

  const totalScore = paymentHistoryScore + completionScore + defiActivityScore + socialProofScore;

  let tier: string;
  let stakeMultiplier: number;
  
  if (totalScore >= 750) {
    tier = 'Platinum';
    stakeMultiplier = 75;
  } else if (totalScore >= 500) {
    tier = 'Gold';
    stakeMultiplier = 100;
  } else if (totalScore >= 250) {
    tier = 'Silver';
    stakeMultiplier = 150;
  } else {
    tier = 'Newcomer';
    stakeMultiplier = 200;
  }

  return {
    user: userPubkey.toString(),
    score: totalScore,
    tier,
    stakeMultiplier,
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
      circlesCompleted: Math.floor(scoreVariation / 10),
      circlesJoined: Math.floor(scoreVariation / 8),
      totalContributions: scoreVariation * 1000,
      missedContributions: Math.max(0, Math.floor((100 - scoreVariation) / 20)),
      socialProofs: [
        {
          type: 'Twitter',
          identifier: '@user' + scoreVariation,
          verified: scoreVariation > 50,
          timestamp: Date.now() - (scoreVariation * 1000000)
        }
      ],
      lastUpdated: Date.now() - (scoreVariation * 10000)
    }
  };
}