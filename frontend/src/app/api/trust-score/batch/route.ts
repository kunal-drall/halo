import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { queryDb } from '@/lib/db';

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

    const trustScores = await getBatchTrustScores(users);

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

async function getBatchTrustScores(addresses: string[]) {
  const validAddresses: string[] = [];
  const addressMap = new Map<string, string>();
  
  for (const addr of addresses) {
    try {
      const pubkey = new PublicKey(addr);
      const base58 = pubkey.toBase58();
      validAddresses.push(base58);
      addressMap.set(base58, addr);
    } catch {
      // Skip invalid addresses
    }
  }
  
  if (validAddresses.length === 0) {
    return addresses.map(addr => ({
      user: addr,
      error: 'Invalid public key'
    }));
  }
  
  const placeholders = validAddresses.map((_, i) => `$${i + 1}`).join(', ');
  const dbUsers = await queryDb<any>(
    `SELECT * FROM users WHERE pubkey IN (${placeholders})`,
    validAddresses
  );
  
  const userMap = new Map<string, any>();
  for (const user of dbUsers) {
    userMap.set(user.pubkey, user);
  }
  
  const results = [];
  
  for (const addr of addresses) {
    try {
      const pubkey = new PublicKey(addr).toBase58();
      const user = userMap.get(pubkey);
      
      if (user) {
        const score = user.trust_score || 100;
        const tier = user.trust_tier || 0;
        const tierName = getTierName(tier);
        
        const paymentHistoryScore = Math.min(400, Math.floor(score * 0.4));
        const completionScore = Math.min(300, Math.floor(score * 0.3));
        const defiActivityScore = Math.min(200, Math.floor(score * 0.2));
        const socialProofScore = Math.min(100, Math.floor(score * 0.1));
        
        results.push({
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
        });
      } else {
        results.push({
          user: pubkey,
          score: 100,
          tier: 'Newcomer',
          stakeMultiplier: 200,
          breakdown: {
            paymentHistory: { score: 40, maxScore: 400, weight: 40, percentage: 10 },
            circleCompletions: { score: 30, maxScore: 300, weight: 30, percentage: 10 },
            defiActivity: { score: 20, maxScore: 200, weight: 20, percentage: 10 },
            socialProofs: { score: 10, maxScore: 100, weight: 10, percentage: 10 }
          },
          metadata: {
            circlesCompleted: 0,
            circlesJoined: 0,
            totalContributions: 0,
            missedContributions: 0,
            socialProofs: [],
            lastUpdated: Date.now()
          }
        });
      }
    } catch (error) {
      results.push({
        user: addr,
        error: 'Invalid public key or data not found'
      });
    }
  }
  
  return results;
}
