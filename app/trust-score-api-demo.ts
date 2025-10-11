/**
 * Trust Score Dashboard API Demo
 * 
 * This script demonstrates the queryable endpoints for frontend dashboards
 * showing how to fetch trust scores, analytics, and batch data.
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { TrustScoreDashboardService } from './trust-score-dashboard-service';
import { HaloProtocolClient } from './halo-client';
import * as anchor from '@coral-xyz/anchor';

// Mock program for demonstration - in production this would be properly initialized
const mockProgram = {} as anchor.Program<any>;

async function demonstrateQueryableEndpoints() {
  console.log('🎯 Trust Score Dashboard API Demo');
  console.log('==================================\n');

  // Initialize connection and service
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  const service = new TrustScoreDashboardService(
    new HaloProtocolClient(mockProgram), 
    connection
  );

  // Generate some demo user addresses for testing
  const demoUsers = [
    Keypair.generate().publicKey.toString(),
    Keypair.generate().publicKey.toString(),
    Keypair.generate().publicKey.toString(),
    Keypair.generate().publicKey.toString(),
    Keypair.generate().publicKey.toString()
  ];

  console.log('📊 Generated demo user addresses:');
  demoUsers.forEach((address, index) => {
    console.log(`  User ${index + 1}: ${address.slice(0, 8)}...${address.slice(-4)}`);
  });
  console.log('');

  try {
    // 1. Single User Trust Score Query
    console.log('1️⃣ Single User Trust Score Query');
    console.log('--------------------------------');
    const singleScore = await service.fetchTrustScore(demoUsers[0]);
    console.log('✅ Single user trust score:', {
      user: singleScore.user.slice(0, 8) + '...' + singleScore.user.slice(-4),
      score: singleScore.score,
      tier: singleScore.tier,
      stakeMultiplier: singleScore.stakeMultiplier + '%'
    });
    console.log('   Breakdown:');
    Object.entries(singleScore.breakdown).forEach(([component, data]) => {
      console.log(`   - ${component}: ${data.score}/${data.maxScore} (${data.percentage}%)`);
    });
    console.log('');

    // 2. Batch Trust Score Query
    console.log('2️⃣ Batch Trust Score Query');
    console.log('---------------------------');
    const batchScores = await service.fetchBatchTrustScores(demoUsers);
    console.log(`✅ Fetched trust scores for ${batchScores.length} users:`);
    batchScores.forEach((score, index) => {
      if (!score.error) {
        console.log(`   User ${index + 1}: Score ${score.score}, Tier ${score.tier}`);
      } else {
        console.log(`   User ${index + 1}: Error - ${score.error}`);
      }
    });
    console.log('');

    // 3. Trust Score Statistics
    console.log('3️⃣ Trust Score Statistics');
    console.log('--------------------------');
    const statistics = await service.getTrustScoreStatistics(demoUsers);
    console.log('✅ Trust score statistics:', {
      totalUsers: statistics.totalUsers,
      averageScore: statistics.averageScore,
      tierDistribution: Object.entries(statistics.scoreDistribution).map(([tier, data]) => 
        `${tier}: ${data.count} users (${data.percentage}%)`
      ).join(', ')
    });
    console.log('   Component averages:', statistics.componentAverages);
    console.log('');

    // 4. Circle Eligibility Validation
    console.log('4️⃣ Circle Eligibility Validation');
    console.log('----------------------------------');
    const mockCircleId = Keypair.generate().publicKey.toString();
    const eligibility = await service.validateCircleEligibility(
      demoUsers[0],
      mockCircleId,
      100000 // 0.1 USDC contribution
    );
    console.log('✅ Circle eligibility check:', {
      eligible: eligibility.eligible,
      requiredStake: 'requiredStake' in eligibility ? eligibility.requiredStake : 'N/A',
      recommendations: 'recommendations' in eligibility ? eligibility.recommendations?.slice(0, 2) : []
    });
    console.log('');

    // 5. Tier Progression Analysis
    console.log('5️⃣ Tier Progression Analysis');
    console.log('-----------------------------');
    const progression = await service.getTierProgression(demoUsers[0]);
    console.log('✅ Tier progression:', {
      currentTier: progression.currentTier,
      currentScore: progression.currentScore,
      nextTier: progression.nextTier,
      pointsToNextTier: progression.pointsToNextTier,
      progression: progression.progression + '%'
    });
    console.log('   Top recommendations:');
    progression.recommendations.slice(0, 3).forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    console.log('');

    // 6. Demonstrate API-style responses
    console.log('6️⃣ API Response Format Examples');
    console.log('--------------------------------');
    
    console.log('GET /api/trust-score?user=<address> response format:');
    console.log(JSON.stringify({
      success: true,
      data: {
        user: singleScore.user,
        score: singleScore.score,
        tier: singleScore.tier,
        stakeMultiplier: singleScore.stakeMultiplier,
        breakdown: singleScore.breakdown
      }
    }, null, 2).slice(0, 300) + '...');
    console.log('');

    console.log('POST /api/trust-score/batch response format:');
    console.log(JSON.stringify({
      success: true,
      count: batchScores.length,
      data: batchScores.slice(0, 2).map(score => ({
        user: score.user,
        score: score.score,
        tier: score.tier
      }))
    }, null, 2));
    console.log('');

    console.log('GET /api/trust-score/analytics response format:');
    console.log(JSON.stringify({
      success: true,
      period: '30d',
      metric: 'summary',
      data: {
        totalUsers: statistics.totalUsers,
        averageScore: statistics.averageScore,
        tierDistribution: statistics.scoreDistribution,
        componentAverages: statistics.componentAverages
      }
    }, null, 2));

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }

  console.log('\n🎉 Trust Score Dashboard API Demo Complete!');
  console.log('\n📝 Summary of Queryable Endpoints:');
  console.log('   • GET  /api/trust-score?user=<address>           - Single user trust score');
  console.log('   • POST /api/trust-score/batch                   - Multiple user trust scores');
  console.log('   • GET  /api/trust-score/analytics               - Trust score analytics');
  console.log('   • POST /api/trust-score/analytics/custom        - Custom filtered analytics');
  console.log('\n🏗️  Implementation Features:');
  console.log('   ✅ Correct scoring weights: 40% payment, 30% completion, 20% DeFi, 10% social');
  console.log('   ✅ Proper tier thresholds: Newcomer, Silver, Gold, Platinum');
  console.log('   ✅ Dynamic stake multipliers: 2x, 1.5x, 1x, 0.75x');
  console.log('   ✅ Dashboard-compatible response formats');
  console.log('   ✅ Batch processing capabilities');
  console.log('   ✅ Error handling and fallbacks');
  console.log('   ✅ Analytics and insights generation');
}

// Run the demo if called directly
if (require.main === module) {
  demonstrateQueryableEndpoints()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Demo failed:', error);
      process.exit(1);
    });
}

export { demonstrateQueryableEndpoints };