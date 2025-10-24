'use client';

import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { solanaClient } from '../lib/solana-client';
import { 
  Circle, 
  Member, 
  CreateCircleParams, 
  JoinCircleParams, 
  ContributionParams, 
  PayoutClaimParams, 
  BidParams, 
  CircleFilters,
  PaymentDue,
  PayoutReady,
  CircleStats,
  UserStats
} from '../types/circles';

export class CircleService {
  private client = solanaClient;

  async isHealthy(): Promise<boolean> {
    try {
      const connection = this.client.getConnection();
      const health = await connection.getHealth();
      return health === 'ok';
    } catch (error) {
      console.error('Circle service health check failed:', error);
      return false;
    }
  }

  async getAllCircles(filters?: CircleFilters): Promise<Circle[]> {
    try {
      await this.client.ensureProgramReady();
      const program = this.client.getProgram();
      if (!program) {
        throw new Error('Halo Protocol program not initialized');
      }

      const circles = await program.account.circle.all();
      
      // Convert to our interface format
      const formattedCircles: Circle[] = circles.map((account) => {
        const circle = account.account;
        return {
          id: circle.id.toString(),
          creator: circle.creator.toBase58(),
          contributionAmount: circle.contributionAmount.toNumber() / LAMPORTS_PER_SOL,
          durationMonths: circle.durationMonths,
          maxMembers: circle.maxMembers,
          currentMembers: circle.currentMembers,
          currentRound: circle.currentMonth,
          status: this.mapCircleStatus(circle.status),
          payoutMethod: this.mapPayoutMethod(circle.payoutMethod),
          minTrustTier: circle.minTrustTier,
          members: circle.members.map(m => m.toBase58()),
          payoutQueue: circle.payoutQueue.map(p => p.toBase58()),
          insurancePool: circle.insurancePool.toBase58(),
          totalYieldEarned: circle.totalYieldEarned.toNumber() / LAMPORTS_PER_SOL,
          nextPayoutRecipient: circle.nextPayoutRecipient?.toBase58(),
          isPublic: circle.isPublic,
          circleType: this.mapCircleType(circle.circleType),
          inviteCode: circle.inviteCode,
          escrowAccount: circle.escrowAccount.toBase58(),
          penaltyRate: circle.penaltyRate,
          totalPot: circle.totalPot.toNumber() / LAMPORTS_PER_SOL,
          createdAt: circle.createdAt,
        };
      });

      // Apply filters
      if (filters) {
        return formattedCircles.filter(circle => {
          if (filters.minContribution && circle.contributionAmount < filters.minContribution) return false;
          if (filters.maxContribution && circle.contributionAmount > filters.maxContribution) return false;
          if (filters.minTrustTier && circle.minTrustTier < filters.minTrustTier) return false;
          if (filters.payoutMethod && circle.payoutMethod !== filters.payoutMethod) return false;
          if (filters.status && circle.status !== filters.status) return false;
          if (filters.isPublic !== undefined && circle.isPublic !== filters.isPublic) return false;
          return true;
        });
      }

      return formattedCircles;
    } catch (error) {
      console.error('Error fetching circles:', error);
      return [];
    }
  }

  async getCircle(circleId: string): Promise<Circle | null> {
    try {
      await this.client.ensureProgramReady();
      const program = this.client.getProgram();
      if (!program) {
        throw new Error('Halo Protocol program not initialized');
      }

      const circlePubkey = new PublicKey(circleId);
      const circle = await program.account.circle.fetch(circlePubkey);
      
      return {
        id: circle.id.toString(),
        creator: circle.creator.toBase58(),
        contributionAmount: circle.contributionAmount.toNumber() / LAMPORTS_PER_SOL,
        durationMonths: circle.durationMonths,
        maxMembers: circle.maxMembers,
        currentMembers: circle.currentMembers,
        currentRound: circle.currentMonth,
        status: this.mapCircleStatus(circle.status),
        payoutMethod: this.mapPayoutMethod(circle.payoutMethod),
        minTrustTier: circle.minTrustTier,
        members: circle.members.map(m => m.toBase58()),
        payoutQueue: circle.payoutQueue.map(p => p.toBase58()),
        insurancePool: circle.insurancePool.toBase58(),
        totalYieldEarned: circle.totalYieldEarned.toNumber() / LAMPORTS_PER_SOL,
        nextPayoutRecipient: circle.nextPayoutRecipient?.toBase58(),
        isPublic: circle.isPublic,
        circleType: this.mapCircleType(circle.circleType),
        inviteCode: circle.inviteCode,
        escrowAccount: circle.escrowAccount.toBase58(),
        penaltyRate: circle.penaltyRate,
        totalPot: circle.totalPot.toNumber() / LAMPORTS_PER_SOL,
        createdAt: circle.createdAt,
      };
    } catch (error) {
      console.error('Error fetching circle:', error);
      return null;
    }
  }

  async getUserCircles(userAddress: PublicKey): Promise<Circle[]> {
    try {
      // Check program status first
      const programStatus = await this.client.checkProgramStatus();
      if (!programStatus.exists) {
        throw new Error(`Program not found: ${programStatus.error}`);
      }
      
      // If IDL is not available, return mock data
      if (!programStatus.hasIdl) {
        console.log('IDL not available, using mock data');
        const mockCircles = JSON.parse(localStorage.getItem('mockCircles') || '[]');
        return mockCircles.filter((circle: any) => circle.creator === userAddress.toString());
      }

      await this.client.ensureProgramReady();
      const program = this.client.getProgram();
      if (!program) {
        throw new Error('Halo Protocol program not initialized');
      }

      // Get all circles where user is a member
      const members = await program.account.member.all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: userAddress.toBase58()
          }
        }
      ]);

      const circles: Circle[] = [];
      for (const member of members) {
        const circle = await this.getCircle(member.account.circle.toBase58());
        if (circle) {
          circles.push(circle);
        }
      }

      return circles;
    } catch (error) {
      console.error('Error fetching user circles:', error);
      return [];
    }
  }

  async createCircle(params: CreateCircleParams, userAddress: PublicKey): Promise<string> {
    try {
      // Check program status first
      const programStatus = await this.client.checkProgramStatus();
      if (!programStatus.exists) {
        throw new Error(`Program not found: ${programStatus.error}`);
      }
      
      // If IDL is not available, provide mock response for now
      if (!programStatus.hasIdl) {
        console.log('IDL not available, using mock response');
        // Simulate successful circle creation with mock data
        const mockCircleId = `mock-circle-${Date.now()}`;
        
        // Add to mock data
        const mockCircle = {
          id: mockCircleId,
          creator: userAddress.toString(),
          contributionAmount: params.contributionAmount,
          durationMonths: params.durationMonths,
          maxMembers: params.maxMembers,
          currentMembers: 1,
          status: 'Forming',
          createdAt: new Date(),
          members: [userAddress.toString()],
          penaltyRate: params.penaltyRate || 500, // 5% default
          payoutMethod: 'FixedRotation',
          circleType: 'Standard',
          isPublic: params.isPublic || false,
          inviteCode: `INV${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          minTrustTier: 1,
          insurancePool: 0,
          totalYieldEarned: 0,
          nextPayoutRecipient: null
        };
        
        // Store in localStorage for demo purposes
        const existingCircles = JSON.parse(localStorage.getItem('mockCircles') || '[]');
        existingCircles.push(mockCircle);
        localStorage.setItem('mockCircles', JSON.stringify(existingCircles));
        
        return mockCircleId;
      }

      // Wait for program to be ready
      await this.client.ensureProgramReady();
      
      const program = this.client.getProgram();
      if (!program) {
        throw new Error('Halo Protocol program not initialized');
      }

      // Generate circle PDA
      const timestamp = Math.floor(Date.now() / 1000);
      const [circlePda] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('circle'),
          userAddress.toBuffer(),
          Buffer.from(timestamp.toString())
        ],
        program.programId
      );

      // Create the circle on-chain
      const tx = await program.methods
        .initializeCircle(
          new BN(params.contributionAmount),
          params.durationMonths,
          params.maxMembers,
          params.penaltyRate || 500
        )
        .accounts({
          circle: circlePda,
          creator: userAddress,
          systemProgram: SystemProgram.programId
        })
        .rpc();

      console.log('✅ Circle created on-chain:', tx);
      return circlePda.toString();
    } catch (error) {
      console.error('Error creating circle:', error);
      throw error;
    }
  }

  async joinCircle(params: JoinCircleParams, userAddress: PublicKey): Promise<string> {
    try {
      await this.client.ensureProgramReady();
      const program = this.client.getProgram();
      if (!program) {
        throw new Error('Halo Protocol program not initialized');
      }

      const circlePubkey = new PublicKey(params.circleId);
      
      // Generate member PDA
      const [memberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), circlePubkey.toBuffer(), userAddress.toBuffer()],
        program.programId
      );

      // Join circle with insurance stake
      const instruction = await program.methods
        .joinCircle(new BN(params.insuranceAmount * LAMPORTS_PER_SOL))
        .accounts({
          circle: circlePubkey,
          member: memberPda,
          memberAuthority: userAddress,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const transaction = new Transaction().add(instruction);
      const signature = await this.client.sendTransaction(transaction, []);

      return signature;
    } catch (error) {
      console.error('Error joining circle:', error);
      throw error;
    }
  }

  async contribute(params: ContributionParams, userAddress: PublicKey): Promise<string> {
    try {
      await this.client.ensureProgramReady();
      const program = this.client.getProgram();
      if (!program) {
        throw new Error('Halo Protocol program not initialized');
      }

      const circlePubkey = new PublicKey(params.circleId);
      
      // Generate member PDA
      const [memberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), circlePubkey.toBuffer(), userAddress.toBuffer()],
        program.programId
      );

      // Make contribution
      const instruction = await program.methods
        .contribute(new BN(params.amount * LAMPORTS_PER_SOL))
        .accounts({
          circle: circlePubkey,
          member: memberPda,
          memberAuthority: userAddress,
          systemProgram: SystemProgram.programId,
        })
        .instruction();

      const transaction = new Transaction().add(instruction);
      const signature = await this.client.sendTransaction(transaction, []);

      return signature;
    } catch (error) {
      console.error('Error making contribution:', error);
      throw error;
    }
  }

  async claimPayout(params: PayoutClaimParams, userAddress: PublicKey): Promise<string> {
    try {
      await this.client.ensureProgramReady();
      const program = this.client.getProgram();
      if (!program) {
        throw new Error('Halo Protocol program not initialized');
      }

      const circlePubkey = new PublicKey(params.circleId);
      
      // Generate member PDA
      const [memberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), circlePubkey.toBuffer(), userAddress.toBuffer()],
        program.programId
      );

      // Generate escrow PDA
      const [escrowPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('escrow'), circlePubkey.toBuffer()],
        program.programId
      );

      // Claim payout
      const instruction = await program.methods
        .claimPayout()
        .accounts({
          circle: circlePubkey,
          member: memberPda,
          escrow: escrowPda,
          memberAuthority: userAddress,
        })
        .instruction();

      const transaction = new Transaction().add(instruction);
      const signature = await this.client.sendTransaction(transaction, []);

      return signature;
    } catch (error) {
      console.error('Error claiming payout:', error);
      throw error;
    }
  }

  async bidForPayout(params: BidParams, userAddress: PublicKey): Promise<string> {
    try {
      await this.client.ensureProgramReady();
      const program = this.client.getProgram();
      if (!program) {
        throw new Error('Halo Protocol program not initialized');
      }

      const circlePubkey = new PublicKey(params.circleId);
      
      // Generate member PDA
      const [memberPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('member'), circlePubkey.toBuffer(), userAddress.toBuffer()],
        program.programId
      );

      // Place bid
      const instruction = await program.methods
        .bidForPayout(new BN(params.bidAmount * LAMPORTS_PER_SOL))
        .accounts({
          circle: circlePubkey,
          member: memberPda,
          memberAuthority: userAddress,
        })
        .instruction();

      const transaction = new Transaction().add(instruction);
      const signature = await this.client.sendTransaction(transaction, []);

      return signature;
    } catch (error) {
      console.error('Error placing bid:', error);
      throw error;
    }
  }

  async getPaymentDue(userAddress: PublicKey): Promise<PaymentDue[]> {
    try {
      const userCircles = await this.getUserCircles(userAddress);
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      const paymentDue: PaymentDue[] = [];

      for (const circle of userCircles) {
        if (circle.status === 'Active') {
          // Calculate due date (simplified - in reality would be more complex)
          const dueDate = circle.createdAt + (circle.currentRound * 30 * oneDay);
          const daysUntilDue = Math.ceil((dueDate - now) / oneDay);
          const isOverdue = daysUntilDue < 0;

          if (daysUntilDue <= 7 || isOverdue) { // Due within 7 days or overdue
            paymentDue.push({
              circleId: circle.id,
              circleName: `Circle ${circle.id.slice(0, 8)}`,
              amount: circle.contributionAmount,
              dueDate,
              daysUntilDue,
              isOverdue,
            });
          }
        }
      }

      return paymentDue;
    } catch (error) {
      console.error('Error getting payment due:', error);
      return [];
    }
  }

  async getPayoutReady(userAddress: PublicKey): Promise<PayoutReady[]> {
    try {
      const userCircles = await this.getUserCircles(userAddress);
      const payoutReady: PayoutReady[] = [];

      for (const circle of userCircles) {
        if (circle.status === 'Active' && circle.nextPayoutRecipient === userAddress.toBase58()) {
          const baseAmount = circle.contributionAmount * circle.currentMembers;
          const yieldShare = circle.totalYieldEarned / circle.currentMembers;
          const totalPayout = baseAmount + yieldShare;

          payoutReady.push({
            circleId: circle.id,
            circleName: `Circle ${circle.id.slice(0, 8)}`,
            baseAmount,
            yieldShare,
            totalPayout,
            canClaim: true,
          });
        }
      }

      return payoutReady;
    } catch (error) {
      console.error('Error getting payout ready:', error);
      return [];
    }
  }

  async getCircleStats(): Promise<CircleStats> {
    try {
      const circles = await this.getAllCircles();
      
      const activeCircles = circles.filter(c => c.status === 'Active');
      const totalMembers = circles.reduce((sum, c) => sum + c.currentMembers, 0);
      const totalValueLocked = circles.reduce((sum, c) => sum + c.totalPot, 0);
      const totalYieldEarned = circles.reduce((sum, c) => sum + c.totalYieldEarned, 0);

      return {
        totalCircles: circles.length,
        activeCircles: activeCircles.length,
        totalMembers,
        totalValueLocked,
        totalYieldEarned,
        averageTrustScore: 650, // Mock data
      };
    } catch (error) {
      console.error('Error getting circle stats:', error);
      return {
        totalCircles: 0,
        activeCircles: 0,
        totalMembers: 0,
        totalValueLocked: 0,
        totalYieldEarned: 0,
        averageTrustScore: 0,
      };
    }
  }

  async getUserStats(userAddress: PublicKey): Promise<UserStats> {
    try {
      const userCircles = await this.getUserCircles(userAddress);
      const completedCircles = userCircles.filter(c => c.status === 'Completed');
      
      return {
        circlesJoined: userCircles.length,
        circlesCompleted: completedCircles.length,
        totalContributions: userCircles.reduce((sum, c) => sum + c.contributionAmount, 0),
        totalPayouts: completedCircles.reduce((sum, c) => sum + c.contributionAmount * c.currentMembers, 0),
        totalYieldEarned: completedCircles.reduce((sum, c) => sum + c.totalYieldEarned, 0),
        currentTrustScore: 650, // Mock data
        trustTier: 1, // Silver tier
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        circlesJoined: 0,
        circlesCompleted: 0,
        totalContributions: 0,
        totalPayouts: 0,
        totalYieldEarned: 0,
        currentTrustScore: 0,
        trustTier: 0,
      };
    }
  }

  // Helper methods for mapping enum values
  private mapCircleStatus(status: any): 'Forming' | 'Active' | 'Completed' | 'Terminated' {
    switch (status) {
      case 'Forming': return 'Forming';
      case 'Active': return 'Active';
      case 'Completed': return 'Completed';
      case 'Terminated': return 'Terminated';
      default: return 'Active';
    }
  }

  private mapPayoutMethod(method: any): 'FixedRotation' | 'Auction' | 'Random' {
    switch (method) {
      case 'FixedRotation': return 'FixedRotation';
      case 'Auction': return 'Auction';
      case 'Random': return 'Random';
      default: return 'FixedRotation';
    }
  }

  private mapCircleType(type: any): 'Standard' | 'AuctionBased' | 'RandomRotation' | 'Hybrid' {
    switch (type) {
      case 'Standard': return 'Standard';
      case 'AuctionBased': return 'AuctionBased';
      case 'RandomRotation': return 'RandomRotation';
      case 'Hybrid': return 'Hybrid';
      default: return 'Standard';
    }
  }
}

export const circleService = new CircleService();
