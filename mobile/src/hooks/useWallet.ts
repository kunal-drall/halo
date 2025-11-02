/**
 * useWallet Hook
 *
 * Simplified wallet management using Privy and Solana context
 */

import { useState, useEffect, useCallback } from 'react';
import { PublicKey } from '@solana/web3.js';
import { usePrivy } from '@privy-io/expo';
import { useSolana } from '../contexts/SolanaContext';

interface WalletState {
  // Wallet info
  address: string | null;
  publicKey: PublicKey | null;
  balance: number | null;

  // Connection state
  isConnected: boolean;
  isAuthenticated: boolean;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshBalance: () => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

export const useWallet = (): WalletState => {
  const { user, authenticated, login, logout } = usePrivy();
  const { connection, balance, refreshBalance: solanaRefreshBalance, isConnected } = useSolana();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get Solana wallet info from Privy
  const solanaWallet = user?.linkedAccounts?.find(
    (account) => account.type === 'solana'
  );

  const address = solanaWallet?.address || null;
  const publicKey = address ? new PublicKey(address) : null;

  // Connect wallet
  const connect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await login();

      // Wait a bit for wallet to be linked
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Refresh balance after connection
      await solanaRefreshBalance();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [login, solanaRefreshBalance]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await logout();
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    setError(null);
    try {
      await solanaRefreshBalance();
    } catch (err) {
      console.error('Failed to refresh balance:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh balance');
    }
  }, [solanaRefreshBalance]);

  return {
    address,
    publicKey,
    balance,
    isConnected: isConnected && authenticated && !!address,
    isAuthenticated: authenticated,
    connect,
    disconnect,
    refreshBalance,
    isLoading,
    error,
  };
};
