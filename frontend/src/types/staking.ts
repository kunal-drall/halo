import { PublicKey } from '@solana/web3.js';

export interface StakingToken {
  mint: PublicKey;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  apy: number;
  totalStaked: number;
  stakerCount: number;
  isActive: boolean;
}

export interface StakingPosition {
  id: string;
  token: StakingToken;
  amount: number;
  stakedAt: Date;
  lockPeriod?: number; // in days, undefined for flexible staking
  rewards: number;
  apy: number;
  status: 'active' | 'unlocking' | 'unlocked';
}

export interface Reward {
  token: StakingToken;
  amount: number;
  lastClaimed: Date;
  pendingAmount: number;
}

export interface Transaction {
  id: string;
  type: 'stake' | 'unstake' | 'claim' | 'compound';
  token: StakingToken;
  amount: number;
  timestamp: Date;
  signature: string;
  status: 'pending' | 'confirmed' | 'failed';
  explorerUrl: string;
}

export interface PortfolioStats {
  totalValueLocked: number;
  totalRewards: number;
  activeStakes: number;
  averageAPY: number;
  totalEarned: number;
}

export interface StakingPool {
  token: StakingToken;
  totalStaked: number;
  totalRewards: number;
  apy: number;
  stakerCount: number;
  isActive: boolean;
  lastUpdated: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  currency: 'USD' | 'SOL' | 'native';
  language: string;
  notifications: {
    rewards: boolean;
    unstaking: boolean;
    priceAlerts: boolean;
  };
  autoCompound: boolean;
  rpcEndpoint: string;
}

export interface AnalyticsData {
  period: '1D' | '7D' | '30D' | '90D' | '1Y';
  portfolioValue: Array<{ date: string; value: number }>;
  rewardsEarned: Array<{ date: string; amount: number }>;
  apyHistory: Array<{ date: string; apy: number }>;
  stakingActivity: Array<{ date: string; stakes: number; unstakes: number }>;
}
