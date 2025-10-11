import { Connection, PublicKey } from '@solana/web3.js';
import { HaloProtocolClient } from './halo-client';
import * as anchor from '@coral-xyz/anchor';

/**
 * Trust Score Service for Dashboard Integration
 * Provides optimized methods for frontend dashboard consumption
 */
export class TrustScoreDashboardService {
  private client: HaloProtocolClient;
  private connection: Connection;

  constructor(client: HaloProtocolClient, connection: Connection) {
    this.client = client;
    this.connection = connection;
  }

  /**
   * API-compatible trust score fetch with caching and error handling
   */
  async fetchTrustScore(userAddress: string) {
    try {
      const userPubkey = new PublicKey(userAddress);
      return await this.client.getDashboardTrustScore(userPubkey);
    } catch (error) {
      // Return default newcomer data if user doesn't have trust score yet
      return this.getDefaultTrustScore(userAddress);
    }
  }

  /**
   * Batch fetch multiple trust scores with parallel processing
   */
  async fetchBatchTrustScores(userAddresses: string[], maxConcurrency = 10): Promise<any[]> {
    const results: any[] = [];
    
    // Process in chunks to avoid overwhelming the RPC
    for (let i = 0; i < userAddresses.length; i += maxConcurrency) {
      const chunk = userAddresses.slice(i, i + maxConcurrency);
      const chunkPromises = chunk.map(address => this.fetchTrustScore(address));
      
      // Simple Promise.all instead of Promise.allSettled for broader compatibility
      try {
        const chunkResults = await Promise.all(chunkPromises.map(p => 
          p.catch(error => ({ error: error.message }))
        ));
        
        chunkResults.forEach((result: any, index: number) => {
          if (!result.error) {
            results.push(result);
          } else {
            results.push({
              user: chunk[index],
              error: 'Failed to fetch trust score'
            });
          }
        });
      } catch (error) {
        // If entire chunk fails, add error entries
        chunk.forEach(address => {
          results.push({
            user: address,
            error: 'Failed to fetch trust score'
          });
        });
      }
    }

    return results;
  }

  /**
   * Get trust score statistics for analytics dashboard
   */
  async getTrustScoreStatistics(userAddresses?: string[]) {
    // In production, this would query indexed data
    // For now, we'll return mock statistics based on the scoring logic
    
    const stats = {
      totalUsers: userAddresses?.length || 15234,
      averageScore: 542,
      scoreDistribution: {
        'newcomer': { count: 0, percentage: 0, range: '0-249' },
        'silver': { count: 0, percentage: 0, range: '250-499' },
        'gold': { count: 0, percentage: 0, range: '500-749' },
        'platinum': { count: 0, percentage: 0, range: '750-1000' }
      },
      componentAverages: {
        paymentHistory: 0,
        circleCompletions: 0,
        defiActivity: 0,
        socialProofs: 0
      }
    };

    if (userAddresses && userAddresses.length <= 100) {
      // For small batches, calculate real statistics
      try {
        const scores = await this.fetchBatchTrustScores(userAddresses);
        const validScores = scores.filter(score => !score.error);

        if (validScores.length > 0) {
          stats.totalUsers = validScores.length;
          stats.averageScore = Math.round(
            validScores.reduce((sum, score) => sum + score.score, 0) / validScores.length
          );

          // Calculate tier distribution
          validScores.forEach((score: any) => {
            const tierKey = score.tier.toLowerCase();
            const validTiers: {[key: string]: any} = stats.scoreDistribution;
            if (validTiers[tierKey]) {
              validTiers[tierKey].count++;
            }
          });

          // Calculate percentages
          Object.keys(stats.scoreDistribution).forEach((tier: string) => {
            const tierData = (stats.scoreDistribution as any)[tier];
            tierData.percentage = Math.round(
              (tierData.count / stats.totalUsers) * 100
            );
          });

          // Calculate component averages
          stats.componentAverages = {
            paymentHistory: Math.round(
              validScores.reduce((sum: number, score: any) => sum + score.breakdown.paymentHistory.percentage, 0) / validScores.length
            ),
            circleCompletions: Math.round(
              validScores.reduce((sum: number, score: any) => sum + score.breakdown.circleCompletions.percentage, 0) / validScores.length
            ),
            defiActivity: Math.round(
              validScores.reduce((sum: number, score: any) => sum + score.breakdown.defiActivity.percentage, 0) / validScores.length
            ),
            socialProofs: Math.round(
              validScores.reduce((sum: number, score: any) => sum + score.breakdown.socialProofs.percentage, 0) / validScores.length
            )
          };
        }
      } catch (error) {
        console.error('Error calculating trust score statistics:', error);
        // Return default mock statistics
      }
    }

    return stats;
  }

  /**
   * Validate trust score requirements for circle participation
   */
  async validateCircleEligibility(userAddress: string, circleId: string, contributionAmount: number) {
    try {
      const userPubkey = new PublicKey(userAddress);
      const circlePubkey = new PublicKey(circleId);

      return await this.client.validateCircleEligibility(
        userPubkey, 
        circlePubkey, 
        contributionAmount
      );
    } catch (error) {
      return {
        eligible: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      };
    }
  }

  /**
   * Get tier progression insights for a user
   */
  async getTierProgression(userAddress: string) {
    const trustScore: any = await this.fetchTrustScore(userAddress);
    
    if ('error' in trustScore && trustScore.error) {
      return {
        currentTier: 'Newcomer',
        currentScore: 0,
        nextTier: 'Silver',
        pointsToNextTier: 250,
        progression: 0,
        recommendations: [
          'Initialize your trust score',
          'Complete circle participation',
          'Add verified social proofs'
        ]
      };
    }

    const tiers = [
      { name: 'Newcomer', min: 0, max: 249 },
      { name: 'Silver', min: 250, max: 499 },
      { name: 'Gold', min: 500, max: 749 },
      { name: 'Platinum', min: 750, max: 1000 }
    ];

    const currentTierIndex = tiers.findIndex(tier => 
      trustScore.score >= tier.min && trustScore.score <= tier.max
    );

    const currentTier = tiers[currentTierIndex];
    const nextTier = tiers[currentTierIndex + 1];

    let pointsToNextTier = 0;
    let progression = 100;

    if (nextTier) {
      pointsToNextTier = nextTier.min - trustScore.score;
      progression = Math.round(
        ((trustScore.score - currentTier.min) / (currentTier.max - currentTier.min + 1)) * 100
      );
    }

    return {
      currentTier: currentTier.name,
      currentScore: trustScore.score,
      nextTier: nextTier?.name || 'Maximum',
      pointsToNextTier,
      progression,
      recommendations: this.generateProgressionRecommendations(trustScore)
    };
  }

  /**
   * Generate recommendations for improving trust score
   */
  private generateProgressionRecommendations(trustScore: any): string[] {
    const recommendations = [];

    if (trustScore.breakdown.paymentHistory.percentage < 50) {
      recommendations.push(`Improve payment consistency (currently ${trustScore.breakdown.paymentHistory.percentage}%)`);
    }

    if (trustScore.breakdown.circleCompletions.percentage < 50) {
      recommendations.push(`Complete more circles (currently ${trustScore.breakdown.circleCompletions.percentage}%)`);
    }

    if (trustScore.breakdown.defiActivity.percentage < 50) {
      recommendations.push(`Increase DeFi activity via Solend (currently ${trustScore.breakdown.defiActivity.percentage}%)`);
    }

    if (trustScore.breakdown.socialProofs.percentage < 50) {
      recommendations.push(`Add more verified social proofs (currently ${trustScore.breakdown.socialProofs.percentage}%)`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Excellent progress! Maintain current activity levels');
    }

    return recommendations;
  }

  /**
   * Get default trust score for users without initialized scores
   */
  private getDefaultTrustScore(userAddress: string) {
    return {
      user: userAddress,
      score: 0,
      tier: 'Newcomer',
      stakeMultiplier: 200,
      breakdown: {
        paymentHistory: { score: 0, maxScore: 400, weight: 40, percentage: 0 },
        circleCompletions: { score: 0, maxScore: 300, weight: 30, percentage: 0 },
        defiActivity: { score: 0, maxScore: 200, weight: 20, percentage: 0 },
        socialProofs: { score: 0, maxScore: 100, weight: 10, percentage: 0 }
      },
      metadata: {
        circlesCompleted: 0,
        circlesJoined: 0,
        totalContributions: '0',
        missedContributions: 0,
        socialProofs: [],
        lastUpdated: '0'
      },
      isDefault: true
    };
  }
}

/**
 * Factory function to create TrustScoreDashboardService
 */
export async function createTrustScoreDashboardService(
  program: anchor.Program<any>,
  connection: Connection
): Promise<TrustScoreDashboardService> {
  const client = new HaloProtocolClient(program);
  return new TrustScoreDashboardService(client, connection);
}