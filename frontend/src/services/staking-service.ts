'use client';

import { PublicKey, Keypair, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { solanaClient } from '../lib/solana-client';
import { StakingPosition, StakingToken, Reward } from '../types/staking';

export class StakingService {
  private client = solanaClient;

  // Get available staking tokens (mock for now, will be replaced with real data)
  async getAvailableTokens(): Promise<StakingToken[]> {
    return [
      {
        mint: new PublicKey('So11111111111111111111111111111111111111112'), // SOL
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        apy: 7.5,
        totalStaked: 1000000,
        stakerCount: 1500,
        isActive: true,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
      },
      {
        mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        apy: 5.2,
        totalStaked: 2000000,
        stakerCount: 2500,
        isActive: true,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
      },
      {
        mint: new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'), // BONK
        symbol: 'BONK',
        name: 'Bonk',
        decimals: 5,
        apy: 12.8,
        totalStaked: 500000,
        stakerCount: 800,
        isActive: true,
        logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I'
      }
    ];
  }

  // Get user's staking positions
  async getUserPositions(userAddress: PublicKey): Promise<StakingPosition[]> {
    try {
      // This would fetch actual positions from the smart contract
      // For now, return mock data
      return [
        {
          id: '1',
          token: {
            mint: new PublicKey('So11111111111111111111111111111111111111112'),
            symbol: 'SOL',
            name: 'Solana',
            decimals: 9,
            apy: 7.5,
            totalStaked: 1000000,
            stakerCount: 1500,
            isActive: true
          },
          amount: 10.5,
          stakedAt: new Date('2024-01-15'),
          rewards: 2.3,
          apy: 7.5,
          status: 'active'
        }
      ];
    } catch (error) {
      console.error('Error fetching user positions:', error);
      return [];
    }
  }

  // Get user's rewards
  async getUserRewards(userAddress: PublicKey): Promise<Reward[]> {
    try {
      // This would fetch actual rewards from the smart contract
      // For now, return mock data
      return [
        {
          token: {
            mint: new PublicKey('So11111111111111111111111111111111111111112'),
            symbol: 'SOL',
            name: 'Solana',
            decimals: 9,
            apy: 7.5,
            totalStaked: 1000000,
            stakerCount: 1500,
            isActive: true
          },
          amount: 2.3,
          lastClaimed: new Date('2024-01-20'),
          pendingAmount: 0.8
        }
      ];
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      return [];
    }
  }

  // Create a new staking position
  async createStake(
    userAddress: PublicKey,
    tokenMint: PublicKey,
    amount: number,
    lockPeriod?: number
  ): Promise<string> {
    try {
      const program = this.client.getProgram();
      if (!program) {
        throw new Error('Halo Protocol program not initialized');
      }
      
      // Generate PDAs for the stake account
      const [stakeAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('stake'), userAddress.toBuffer(), tokenMint.toBuffer()],
        program.programId
      );

      // Create the stake instruction
      const instruction = await program.methods
        .initializeStake(
          tokenMint,
          new BN(amount * LAMPORTS_PER_SOL), // Convert to lamports
          lockPeriod || 0
        )
        .accounts({
          stakeAccount,
          user: userAddress,
          tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      // For now, return a mock transaction signature
      // In production, this would sign and send the actual transaction
      return 'mock_transaction_signature_' + Date.now();
    } catch (error) {
      console.error('Error creating stake:', error);
      throw error;
    }
  }

  // Unstake tokens
  async unstake(positionId: string, amount: number): Promise<string> {
    try {
      // This would interact with the smart contract to unstake
      // For now, return a mock transaction signature
      return 'mock_unstake_signature_' + Date.now();
    } catch (error) {
      console.error('Error unstaking:', error);
      throw error;
    }
  }

  // Claim rewards
  async claimRewards(userAddress: PublicKey, tokenMint?: PublicKey): Promise<string> {
    try {
      // This would interact with the smart contract to claim rewards
      // For now, return a mock transaction signature
      return 'mock_claim_signature_' + Date.now();
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }

  // Get portfolio statistics
  async getPortfolioStats(userAddress: PublicKey) {
    try {
      const positions = await this.getUserPositions(userAddress);
      const rewards = await this.getUserRewards(userAddress);
      
      const totalValueLocked = positions.reduce((sum, pos) => sum + pos.amount, 0);
      const totalRewards = rewards.reduce((sum, reward) => sum + reward.amount + reward.pendingAmount, 0);
      const activeStakes = positions.length;
      const averageAPY = positions.length > 0 
        ? positions.reduce((sum, pos) => sum + pos.apy, 0) / positions.length 
        : 0;

      return {
        totalValueLocked,
        totalRewards,
        activeStakes,
        averageAPY,
        totalEarned: totalRewards
      };
    } catch (error) {
      console.error('Error getting portfolio stats:', error);
      return {
        totalValueLocked: 0,
        totalRewards: 0,
        activeStakes: 0,
        averageAPY: 0,
        totalEarned: 0
      };
    }
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    return await this.client.isHealthy();
  }
}

// Singleton instance
export const stakingService = new StakingService();
