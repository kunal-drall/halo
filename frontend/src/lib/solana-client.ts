'use client';

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { HaloProtocolProgram } from '../types/halo_protocol';

// Simple wallet implementation
class SimpleWallet {
  constructor(public keypair: Keypair) {}
  
  get publicKey() {
    return this.keypair.publicKey;
  }
  
  async signTransaction(tx: any) {
    tx.sign(this.keypair);
    return tx;
  }
  
  async signAllTransactions(txs: any[]) {
    return txs.map(tx => {
      tx.sign(this.keypair);
      return tx;
    });
  }
}

export class SolanaClient {
  private connection: Connection;
  private program: Program<HaloProtocolProgram> | null = null;
  private programReady: Promise<void>;
  private provider: AnchorProvider;

  constructor() {
    const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    
    // Create a dummy wallet for now - will be replaced with actual wallet
    const dummyWallet = new SimpleWallet(Keypair.generate());
    
    this.provider = new AnchorProvider(
      this.connection,
      dummyWallet,
      { commitment: 'confirmed' }
    );

    // Get program ID with fallback
    const programId = process.env.NEXT_PUBLIC_PROGRAM_ID || '9KmMjZrsvTdRnfr2dZerby2d5f6tjyPZwViweQxV2FnR';
    
    // Initialize the program asynchronously
    this.programReady = this.initializeProgram(programId);
  }

  private async initializeProgram(programId: string): Promise<void> {
    try {
      const idl = await this.loadIDL(programId);
      // Program constructor: Program(idl, provider, opts)
      // If IDL has address field, it will use that, otherwise we pass programId in opts
      const programIdPubkey = new PublicKey(idl.address || programId);
      this.program = new Program(
        idl as any,
        this.provider
      ) as any;
      // Set programId explicitly if needed
      if (this.program) {
        (this.program as any).programId = programIdPubkey;
      }
      console.log('✅ Program initialized with full IDL');
    } catch (error) {
      console.error('Error initializing program:', error);
      this.program = null;
    }
  }

  async loadIDL(programId: string): Promise<any> {
    try {
      // Try to fetch from public directory
      const response = await fetch('/halo_protocol.json');
      if (response.ok) {
        const fullIdl = await response.json();
        if (fullIdl && fullIdl.instructions && fullIdl.instructions.length > 0) {
          console.log('✅ Loaded full IDL from public directory');
          return fullIdl;
        }
      }
    } catch (error) {
      console.log('Could not load IDL from public directory:', error);
    }
    
    // Fallback to minimal IDL
    return {
      "version": "0.1.0",
      "name": "halo_protocol",
      "instructions": [
        {
          "name": "initializeCircle",
          "accounts": [
            { "name": "circle", "isMut": true, "isSigner": false },
            { "name": "creator", "isMut": true, "isSigner": true },
            { "name": "systemProgram", "isMut": false, "isSigner": false }
          ],
          "args": [
            { "name": "contributionAmount", "type": "u64" },
            { "name": "durationMonths", "type": "u8" },
            { "name": "maxMembers", "type": "u8" },
            { "name": "penaltyRate", "type": "u16" }
          ]
        }
      ],
      "accounts": [
        {
          "name": "Circle",
          "type": {
            "kind": "struct",
            "fields": [
              { "name": "creator", "type": "publicKey" },
              { "name": "contributionAmount", "type": "u64" },
              { "name": "durationMonths", "type": "u8" },
              { "name": "maxMembers", "type": "u8" },
              { "name": "currentMembers", "type": "u8" },
              { "name": "status", "type": "u8" },
              { "name": "createdAt", "type": "i64" }
            ]
          }
        }
      ],
      "types": []
    };
  }

  getConnection(): Connection {
    return this.connection;
  }

  async ensureProgramReady(): Promise<void> {
    await this.programReady;
  }

  getProgram(): Program<HaloProtocolProgram> | null {
    return this.program;
  }

  async getAccountInfo(publicKey: PublicKey) {
    return await this.connection.getAccountInfo(publicKey);
  }

  async getBalance(publicKey: PublicKey) {
    return await this.connection.getBalance(publicKey);
  }

  async getTokenAccountsByOwner(owner: PublicKey, mint?: PublicKey) {
    return await this.connection.getTokenAccountsByOwner(owner, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
    });
  }

  // Circle-related methods
  async getCircle(circleAddress: PublicKey) {
    if (!this.program) {
      console.warn('Program not initialized');
      return null;
    }
    try {
      return await (this.program.account as any).circle.fetch(circleAddress);
    } catch (error) {
      console.error('Error fetching circle:', error);
      return null;
    }
  }

  async getAllCircles() {
    if (!this.program) {
      console.warn('Program not initialized');
      return [];
    }
    try {
      return await (this.program.account as any).circle.all();
    } catch (error) {
      console.error('Error fetching circles:', error);
      return [];
    }
  }

  // Member-related methods
  async getMember(memberAddress: PublicKey) {
    if (!this.program) {
      console.warn('Program not initialized');
      return null;
    }
    try {
      return await (this.program.account as any).member.fetch(memberAddress);
    } catch (error) {
      console.error('Error fetching member:', error);
      return null;
    }
  }

  async getMembersByCircle(circleAddress: PublicKey) {
    if (!this.program) {
      console.warn('Program not initialized');
      return [];
    }
    try {
      return await (this.program.account as any).member.all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: circleAddress.toBase58()
          }
        }
      ]);
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  }

  // Trust score methods
  async getTrustScore(authority: PublicKey) {
    if (!this.program) {
      console.warn('Program not initialized');
      return null;
    }
    try {
      return await (this.program.account as any).trustScore.fetch(authority);
    } catch (error) {
      console.error('Error fetching trust score:', error);
      return null;
    }
  }

  // Escrow methods
  async getEscrow(escrowAddress: PublicKey) {
    if (!this.program) {
      console.warn('Program not initialized');
      return null;
    }
    try {
      return await (this.program.account as any).escrow.fetch(escrowAddress);
    } catch (error) {
      console.error('Error fetching escrow:', error);
      return null;
    }
  }

  // Transaction methods
  async sendTransaction(transaction: any, signers: Keypair[]) {
    try {
      const signature = await this.connection.sendTransaction(transaction, signers);
      await this.connection.confirmTransaction(signature);
      return signature;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  // Utility methods
  async getRecentBlockhash() {
    return await this.connection.getRecentBlockhash();
  }

  async getSlot() {
    return await this.connection.getSlot();
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      // Use getVersion as a health check instead of getHealth
      await this.connection.getVersion();
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Check program status
  async checkProgramStatus(): Promise<{ exists: boolean; hasIdl: boolean; error?: string }> {
    try {
      const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '9KmMjZrsvTdRnfr2dZerby2d5f6tjyPZwViweQxV2FnR');
      
      // Check if program exists
      const programInfo = await this.connection.getAccountInfo(programId);
      if (!programInfo) {
        return { exists: false, hasIdl: false, error: 'Program not found on chain' };
      }

      // Try to fetch IDL from the program
      try {
        const idl = await Program.fetchIdl(programId, this.provider);
        if (idl) {
          return { exists: true, hasIdl: true };
        }
      } catch (idlError) {
        console.log('IDL not found on-chain, checking local IDL');
      }

      // Check if we have a local IDL file
      try {
        const response = await fetch('/halo_protocol.json');
        if (response.ok) {
          const localIdl = await response.json();
          if (localIdl && localIdl.instructions && localIdl.instructions.length > 0) {
            console.log('✅ Local IDL found and valid');
            return { exists: true, hasIdl: true };
          }
        }
      } catch (fetchError) {
        console.log('Could not load local IDL:', fetchError);
      }

      // If we have a program instance with IDL, that's good enough
      if (this.program && this.program.idl) {
        return { exists: true, hasIdl: true };
      }

      return { exists: true, hasIdl: false, error: 'IDL not available - using mock data' };
    } catch (error) {
      return { exists: false, hasIdl: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Singleton instance
export const solanaClient = new SolanaClient();
