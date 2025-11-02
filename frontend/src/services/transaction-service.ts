'use client';

import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { solanaClient } from '../lib/solana-client';
import { Transaction as AppTransaction } from '../types/staking';

export class TransactionService {
  private client = solanaClient;

  // Get transaction history for a user
  async getTransactionHistory(userAddress: PublicKey): Promise<AppTransaction[]> {
    try {
      // This would fetch actual transaction history from the blockchain
      // For now, return mock data
      return [
        {
          id: '1',
          type: 'stake',
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
          timestamp: new Date('2024-01-15T10:30:00Z'),
          signature: 'mock_signature_1',
          status: 'confirmed',
          explorerUrl: `https://explorer.solana.com/tx/mock_signature_1?cluster=devnet`
        },
        {
          id: '2',
          type: 'claim',
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
          timestamp: new Date('2024-01-20T14:15:00Z'),
          signature: 'mock_signature_2',
          status: 'confirmed',
          explorerUrl: `https://explorer.solana.com/tx/mock_signature_2?cluster=devnet`
        }
      ];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  // Get transaction by signature
  async getTransaction(signature: string) {
    try {
      return await this.client.getConnection().getTransaction(signature);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  // Get transaction status
  async getTransactionStatus(signature: string): Promise<'pending' | 'confirmed' | 'failed'> {
    try {
      const tx = await this.getTransaction(signature);
      if (!tx) return 'failed';
      
      if (tx.meta?.err) return 'failed';
      return 'confirmed';
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return 'failed';
    }
  }

  // Wait for transaction confirmation
  async waitForConfirmation(signature: string, timeout: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const status = await this.getTransactionStatus(signature);
      if (status === 'confirmed') return true;
      if (status === 'failed') return false;
      
      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false; // Timeout
  }

  // Create a transaction for staking
  async createStakeTransaction(
    userAddress: PublicKey,
    tokenMint: PublicKey,
    amount: number,
    lockPeriod?: number
  ): Promise<Transaction> {
    try {
      const program = this.client.getProgram();
      if (!program) {
        throw new Error('Halo Protocol program not initialized');
      }
      
      // Generate PDAs
      const [stakeAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('stake'), userAddress.toBuffer(), tokenMint.toBuffer()],
        program.programId
      );

      // Create the transaction
      const transaction = new Transaction();
      
      // Add the stake instruction
      const instruction = await program.methods
        .initializeStake(
          tokenMint,
          new BN(amount * LAMPORTS_PER_SOL),
          lockPeriod || 0
        )
        .accounts({
          stakeAccount,
          user: userAddress,
          tokenMint,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      transaction.add(instruction);
      
      // Set recent blockhash
      const { blockhash } = await this.client.getConnection().getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userAddress;

      return transaction;
    } catch (error) {
      console.error('Error creating stake transaction:', error);
      throw error;
    }
  }

  // Create a transaction for unstaking
  async createUnstakeTransaction(
    userAddress: PublicKey,
    positionId: string,
    amount: number
  ): Promise<Transaction> {
    try {
      // This would create an actual unstake transaction
      // For now, return a mock transaction
      const transaction = new Transaction();
      
      // Set recent blockhash
      const { blockhash } = await this.client.getConnection().getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userAddress;

      return transaction;
    } catch (error) {
      console.error('Error creating unstake transaction:', error);
      throw error;
    }
  }

  // Create a transaction for claiming rewards
  async createClaimRewardsTransaction(
    userAddress: PublicKey,
    tokenMint?: PublicKey
  ): Promise<Transaction> {
    try {
      // This would create an actual claim rewards transaction
      // For now, return a mock transaction
      const transaction = new Transaction();
      
      // Set recent blockhash
      const { blockhash } = await this.client.getConnection().getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = userAddress;

      return transaction;
    } catch (error) {
      console.error('Error creating claim rewards transaction:', error);
      throw error;
    }
  }

  // Send and confirm transaction
  async sendAndConfirmTransaction(
    transaction: Transaction,
    signers: any[] = []
  ): Promise<string> {
    try {
      const signature = await this.client.getConnection().sendTransaction(transaction, signers);
      await this.client.getConnection().confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  // Get explorer URL for a transaction
  getExplorerUrl(signature: string, cluster: 'mainnet' | 'devnet' | 'testnet' = 'devnet'): string {
    return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
  }

  // Get account URL for explorer
  getAccountExplorerUrl(address: string, cluster: 'mainnet' | 'devnet' | 'testnet' = 'devnet'): string {
    return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
  }
}

// Singleton instance
export const transactionService = new TransactionService();
