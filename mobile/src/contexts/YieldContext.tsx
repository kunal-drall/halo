/**
 * Yield Context
 *
 * Manages yield tracking and Reflect integration
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useSolana } from './SolanaContext';

export enum ReflectTokenType {
  USDCPlus = 'USDC+',
  USDJ = 'USDJ',
}

export interface YieldSource {
  name: string;
  apy: number;
  earned: number;
  color: string;
}

export interface YieldBreakdown {
  reflectYield: YieldSource;
  solendYield: YieldSource;
  totalAPY: number;
  totalEarned: number;
  dailyEarnings: number;
  projectedMonthly: number;
  projectedYearly: number;
}

export interface StakedPosition {
  id: string;
  tokenType: ReflectTokenType;
  amount: number;
  stakedAt: number;
  currentValue: number;
  totalEarned: number;
  reflectAPY: number;
  solendAPY: number;
  combinedAPY: number;
}

export interface YieldStrategy {
  name: string;
  description: string;
  tokenType: ReflectTokenType;
  expectedAPY: number;
  riskLevel: 'low' | 'medium' | 'high';
  minAmount: number;
}

interface YieldContextType {
  // Positions
  positions: StakedPosition[];
  totalStaked: number;
  totalEarned: number;
  fetchPositions: () => Promise<void>;

  // Yield breakdown
  yieldBreakdown: YieldBreakdown | null;
  fetchYieldBreakdown: (amount: number, tokenType?: ReflectTokenType) => Promise<void>;

  // Staking
  stakeUSDCPlus: (amount: number) => Promise<string>;
  stakeUSDJ: (amount: number) => Promise<string>;
  unstake: (positionId: string) => Promise<void>;

  // Strategies
  strategies: YieldStrategy[];
  getRecommendedStrategy: (amount: number) => YieldStrategy | null;

  // Reflect integration
  reflectInitialized: boolean;
  initializeReflect: () => Promise<void>;
  refreshPrices: () => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

const YieldContext = createContext<YieldContextType | undefined>(undefined);

const MOCK_STRATEGIES: YieldStrategy[] = [
  {
    name: 'Conservative Stablecoin',
    description: 'Low-risk yield through USDC+ with native price appreciation',
    tokenType: ReflectTokenType.USDCPlus,
    expectedAPY: 4.5,
    riskLevel: 'low',
    minAmount: 100,
  },
  {
    name: 'Balanced Growth',
    description: 'Medium-risk with USDJ delta-neutral funding rate capture',
    tokenType: ReflectTokenType.USDJ,
    expectedAPY: 6.8,
    riskLevel: 'medium',
    minAmount: 500,
  },
];

interface YieldProviderProps {
  children: ReactNode;
}

export const YieldProvider: React.FC<YieldProviderProps> = ({ children }) => {
  const { connection, program } = useSolana();
  const [positions, setPositions] = useState<StakedPosition[]>([]);
  const [yieldBreakdown, setYieldBreakdown] = useState<YieldBreakdown | null>(null);
  const [reflectInitialized, setReflectInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate totals
  const totalStaked = positions.reduce((sum, pos) => sum + pos.amount, 0);
  const totalEarned = positions.reduce((sum, pos) => sum + pos.totalEarned, 0);

  // Initialize Reflect
  const initializeReflect = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Initialize real Reflect SDK
      console.log('Initializing Reflect yield layer...');

      await new Promise(resolve => setTimeout(resolve, 1000));

      setReflectInitialized(true);
      console.log('Reflect initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Reflect:', error);
      setError('Failed to initialize yield layer');
      setReflectInitialized(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch positions
  const fetchPositions = async () => {
    if (!connection || !program) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Fetch from program
      // For now, mock data
      const mockPositions: StakedPosition[] = [
        {
          id: 'pos_1',
          tokenType: ReflectTokenType.USDCPlus,
          amount: 1000,
          stakedAt: Date.now() - 86400000 * 30, // 30 days ago
          currentValue: 1037.5,
          totalEarned: 37.5,
          reflectAPY: 4.5,
          solendAPY: 3.2,
          combinedAPY: 7.7,
        },
        {
          id: 'pos_2',
          tokenType: ReflectTokenType.USDJ,
          amount: 2000,
          stakedAt: Date.now() - 86400000 * 15, // 15 days ago
          currentValue: 2045.0,
          totalEarned: 45.0,
          reflectAPY: 6.8,
          solendAPY: 3.2,
          combinedAPY: 10.0,
        },
      ];

      setPositions(mockPositions);
    } catch (error) {
      console.error('Failed to fetch positions:', error);
      setError('Failed to fetch positions');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch yield breakdown
  const fetchYieldBreakdown = async (
    amount: number,
    tokenType: ReflectTokenType = ReflectTokenType.USDCPlus
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Fetch real yields from Reflect and Solend
      const reflectAPY = tokenType === ReflectTokenType.USDCPlus ? 4.5 : 6.8;
      const solendAPY = 3.2;
      const totalAPY = reflectAPY + solendAPY;

      const dailyRate = totalAPY / 365 / 100;
      const dailyEarnings = amount * dailyRate;

      const breakdown: YieldBreakdown = {
        reflectYield: {
          name: tokenType === ReflectTokenType.USDCPlus ? 'Reflect USDC+' : 'Reflect USDJ',
          apy: reflectAPY,
          earned: dailyEarnings * (reflectAPY / totalAPY),
          color: '#22c55e',
        },
        solendYield: {
          name: 'Solend Lending',
          apy: solendAPY,
          earned: dailyEarnings * (solendAPY / totalAPY),
          color: '#3b82f6',
        },
        totalAPY,
        totalEarned: dailyEarnings,
        dailyEarnings,
        projectedMonthly: dailyEarnings * 30,
        projectedYearly: dailyEarnings * 365,
      };

      setYieldBreakdown(breakdown);
    } catch (error) {
      console.error('Failed to fetch yield breakdown:', error);
      setError('Failed to fetch yields');
    } finally {
      setIsLoading(false);
    }
  };

  // Stake USDC+
  const stakeUSDCPlus = async (amount: number): Promise<string> => {
    if (!connection || !program) {
      throw new Error('Solana not connected');
    }

    if (!reflectInitialized) {
      await initializeReflect();
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Staking USDC+:', amount);

      // TODO: Call program instruction with Reflect integration
      const txId = 'mock_tx_' + Date.now();

      await fetchPositions();

      return txId;
    } catch (error) {
      console.error('Failed to stake USDC+:', error);
      setError('Failed to stake');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Stake USDJ
  const stakeUSDJ = async (amount: number): Promise<string> => {
    if (!connection || !program) {
      throw new Error('Solana not connected');
    }

    if (!reflectInitialized) {
      await initializeReflect();
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Staking USDJ:', amount);

      // TODO: Call program instruction with Reflect integration
      const txId = 'mock_tx_' + Date.now();

      await fetchPositions();

      return txId;
    } catch (error) {
      console.error('Failed to stake USDJ:', error);
      setError('Failed to stake');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Unstake
  const unstake = async (positionId: string): Promise<void> => {
    if (!connection || !program) {
      throw new Error('Solana not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Unstaking position:', positionId);

      // TODO: Call program instruction
      await fetchPositions();
    } catch (error) {
      console.error('Failed to unstake:', error);
      setError('Failed to unstake');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get recommended strategy
  const getRecommendedStrategy = (amount: number): YieldStrategy | null => {
    const eligible = MOCK_STRATEGIES.filter(s => amount >= s.minAmount);
    if (eligible.length === 0) return null;

    // Recommend higher APY if amount is substantial
    return amount >= 500 ? eligible[eligible.length - 1] : eligible[0];
  };

  // Refresh prices
  const refreshPrices = async () => {
    if (!reflectInitialized) return;

    try {
      // TODO: Fetch latest Reflect token prices
      console.log('Refreshing Reflect prices...');
      await fetchPositions();
    } catch (error) {
      console.error('Failed to refresh prices:', error);
    }
  };

  // Auto-fetch positions when initialized
  useEffect(() => {
    if (reflectInitialized && connection) {
      fetchPositions();
    }
  }, [reflectInitialized, connection]);

  const value: YieldContextType = {
    positions,
    totalStaked,
    totalEarned,
    fetchPositions,
    yieldBreakdown,
    fetchYieldBreakdown,
    stakeUSDCPlus,
    stakeUSDJ,
    unstake,
    strategies: MOCK_STRATEGIES,
    getRecommendedStrategy,
    reflectInitialized,
    initializeReflect,
    refreshPrices,
    isLoading,
    error,
  };

  return <YieldContext.Provider value={value}>{children}</YieldContext.Provider>;
};

export const useYield = (): YieldContextType => {
  const context = useContext(YieldContext);
  if (context === undefined) {
    throw new Error('useYield must be used within a YieldProvider');
  }
  return context;
};
