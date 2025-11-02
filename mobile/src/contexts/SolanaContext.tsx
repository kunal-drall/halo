/**
 * Solana Context
 *
 * Manages Solana blockchain connection and wallet state
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor';
import { usePrivy } from '@privy-io/expo';
import * as SecureStore from 'expo-secure-store';

// Import IDL (will be generated from Anchor program)
// import { HaloProtocol } from '../idl/halo_protocol';
// import idl from '../idl/halo_protocol.json';

interface SolanaContextType {
  connection: Connection | null;
  programId: PublicKey | null;
  program: Program | null;
  isConnected: boolean;
  cluster: 'devnet' | 'testnet' | 'mainnet-beta';
  setCluster: (cluster: 'devnet' | 'testnet' | 'mainnet-beta') => void;
  balance: number | null;
  refreshBalance: () => Promise<void>;
}

const SolanaContext = createContext<SolanaContextType | undefined>(undefined);

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: React.FC<SolanaProviderProps> = ({ children }) => {
  const { user, authenticated } = usePrivy();
  const [connection, setConnection] = useState<Connection | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [cluster, setCluster] = useState<'devnet' | 'testnet' | 'mainnet-beta'>('devnet');
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  // Program ID - should match deployed program
  const PROGRAM_ID = new PublicKey('YOUR_PROGRAM_ID_HERE');

  // Initialize connection when cluster changes
  useEffect(() => {
    const initConnection = async () => {
      try {
        // Load saved cluster preference
        const savedCluster = await SecureStore.getItemAsync('solana_cluster');
        if (savedCluster && (savedCluster === 'devnet' || savedCluster === 'testnet' || savedCluster === 'mainnet-beta')) {
          setCluster(savedCluster);
        }

        // Create connection
        const rpcUrl = clusterApiUrl(cluster);
        const conn = new Connection(rpcUrl, 'confirmed');
        setConnection(conn);
        setIsConnected(true);

        console.log(`Connected to Solana ${cluster}`);
      } catch (error) {
        console.error('Failed to initialize Solana connection:', error);
        setIsConnected(false);
      }
    };

    initConnection();
  }, [cluster]);

  // Initialize Anchor program when connection and user are ready
  useEffect(() => {
    const initProgram = async () => {
      if (!connection || !authenticated || !user) {
        setProgram(null);
        return;
      }

      try {
        // Get Solana wallet from Privy
        const solanaWallet = user.linkedAccounts?.find(
          (account) => account.type === 'solana'
        );

        if (!solanaWallet) {
          console.warn('No Solana wallet linked');
          return;
        }

        // Create mock wallet for AnchorProvider
        // In production, you'd use the actual Privy wallet interface
        const wallet = {
          publicKey: new PublicKey(solanaWallet.address),
          signTransaction: async (tx: any) => tx,
          signAllTransactions: async (txs: any[]) => txs,
        };

        // Create provider
        const provider = new AnchorProvider(
          connection,
          wallet as any,
          { commitment: 'confirmed' }
        );

        // Create program instance
        // Uncomment when IDL is available:
        // const program = new Program(idl as Idl, PROGRAM_ID, provider);
        // setProgram(program);

        console.log('Anchor program initialized');
      } catch (error) {
        console.error('Failed to initialize Anchor program:', error);
      }
    };

    initProgram();
  }, [connection, authenticated, user]);

  // Refresh balance
  const refreshBalance = async () => {
    if (!connection || !authenticated || !user) {
      setBalance(null);
      return;
    }

    try {
      const solanaWallet = user.linkedAccounts?.find(
        (account) => account.type === 'solana'
      );

      if (!solanaWallet) {
        setBalance(null);
        return;
      }

      const publicKey = new PublicKey(solanaWallet.address);
      const lamports = await connection.getBalance(publicKey);
      const sol = lamports / 1e9; // Convert lamports to SOL
      setBalance(sol);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalance(null);
    }
  };

  // Update balance when connection or user changes
  useEffect(() => {
    refreshBalance();
  }, [connection, authenticated, user]);

  // Save cluster preference
  const handleSetCluster = async (newCluster: 'devnet' | 'testnet' | 'mainnet-beta') => {
    try {
      await SecureStore.setItemAsync('solana_cluster', newCluster);
      setCluster(newCluster);
    } catch (error) {
      console.error('Failed to save cluster preference:', error);
    }
  };

  const value: SolanaContextType = {
    connection,
    programId: PROGRAM_ID,
    program,
    isConnected,
    cluster,
    setCluster: handleSetCluster,
    balance,
    refreshBalance,
  };

  return <SolanaContext.Provider value={value}>{children}</SolanaContext.Provider>;
};

export const useSolana = (): SolanaContextType => {
  const context = useContext(SolanaContext);
  if (context === undefined) {
    throw new Error('useSolana must be used within a SolanaProvider');
  }
  return context;
};
