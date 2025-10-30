/**
 * useCircles Hook
 *
 * Manage circle operations (fetch, create, join, etc.)
 */

import { useState, useEffect, useCallback } from 'react';
import { PublicKey, BN } from '@solana/web3.js';
import { useSolana } from '../contexts/SolanaContext';
import { usePrivacy, PrivacyMode } from '../contexts/PrivacyContext';
import { apiService, Circle, Member } from '../services/api';
import { BlockchainService } from '../services/blockchain';
import { useWallet } from './useWallet';

interface UseCirclesState {
  // Data
  circles: Circle[];
  myCircles: Circle[];
  availableCircles: Circle[];

  // Single circle operations
  getCircle: (circleId: string) => Promise<Circle | null>;
  getCircleMembers: (circleId: string) => Promise<Member[]>;

  // Actions
  createCircle: (params: {
    amount: number;
    duration: number;
    members: number;
    name?: string;
    privacyMode?: PrivacyMode;
  }) => Promise<string>;

  joinCircle: (circleId: string, anonymous?: boolean) => Promise<void>;

  refreshCircles: () => Promise<void>;

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

export const useCircles = (): UseCirclesState => {
  const { connection, program, programId } = useSolana();
  const { settings } = usePrivacy();
  const { address, publicKey } = useWallet();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter circles by user participation
  const myCircles = circles.filter(
    (c) => c.creator === address || c.currentMembers > 0
  );

  const availableCircles = circles.filter(
    (c) => c.creator !== address && c.currentMembers < c.maxMembers
  );

  // Fetch circles from API
  const fetchCircles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getCircles();

      if (response.success && response.data) {
        setCircles(response.data);
      } else {
        setError(response.error || 'Failed to fetch circles');
      }
    } catch (err) {
      console.error('Failed to fetch circles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch circles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get single circle
  const getCircle = useCallback(async (circleId: string): Promise<Circle | null> => {
    try {
      const response = await apiService.getCircle(circleId);

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch (err) {
      console.error('Failed to fetch circle:', err);
      return null;
    }
  }, []);

  // Get circle members
  const getCircleMembers = useCallback(async (circleId: string): Promise<Member[]> => {
    try {
      const response = await apiService.getCircleMembers(circleId);

      if (response.success && response.data) {
        return response.data;
      }

      return [];
    } catch (err) {
      console.error('Failed to fetch circle members:', err);
      return [];
    }
  }, []);

  // Create circle
  const createCircle = useCallback(async (params: {
    amount: number;
    duration: number;
    members: number;
    name?: string;
    privacyMode?: PrivacyMode;
  }): Promise<string> => {
    if (!connection || !program || !publicKey) {
      throw new Error('Wallet not connected');
    }

    setIsCreating(true);
    setError(null);

    try {
      // Create blockchain service
      const blockchainService = new BlockchainService(
        connection,
        programId!.toString()
      );
      blockchainService.setProgram(program);

      // Create circle on-chain
      const txId = await blockchainService.createCircle({
        creator: publicKey,
        totalAmount: new BN(params.amount * 1e6), // Convert to lamports
        duration: new BN(params.duration),
        maxMembers: params.members,
        privacyMode: params.privacyMode as any,
      });

      console.log('Circle created on-chain:', txId);

      // Register circle with API
      const response = await apiService.createCircle({
        ...params,
        privacyMode: params.privacyMode,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to register circle');
      }

      // Refresh circles list
      await fetchCircles();

      return response.data!.circleId;
    } catch (err) {
      console.error('Failed to create circle:', err);
      setError(err instanceof Error ? err.message : 'Failed to create circle');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [connection, program, publicKey, programId, fetchCircles]);

  // Join circle
  const joinCircle = useCallback(async (circleId: string, anonymous: boolean = false) => {
    if (!connection || !program || !publicKey || !address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Join via API
      const response = await apiService.joinCircle(circleId, {
        wallet: address,
        anonymous,
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to join circle');
      }

      console.log('Joined circle:', circleId);

      // Refresh circles list
      await fetchCircles();
    } catch (err) {
      console.error('Failed to join circle:', err);
      setError(err instanceof Error ? err.message : 'Failed to join circle');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [connection, program, publicKey, address, fetchCircles]);

  // Refresh circles
  const refreshCircles = useCallback(async () => {
    await fetchCircles();
  }, [fetchCircles]);

  // Auto-fetch circles on mount
  useEffect(() => {
    if (connection && address) {
      fetchCircles();
    }
  }, [connection, address, fetchCircles]);

  return {
    circles,
    myCircles,
    availableCircles,
    getCircle,
    getCircleMembers,
    createCircle,
    joinCircle,
    refreshCircles,
    isLoading,
    isCreating,
    error,
  };
};
