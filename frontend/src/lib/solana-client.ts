'use client';

import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import { HaloProtocolProgram } from '../types/halo_protocol';

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
  private programReady: Promise<void> | null = null;
  private provider: AnchorProvider | null = null;
  private isInitialized = false;

  constructor() {
    const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.devnet.solana.com';
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    
    if (typeof window !== 'undefined') {
      const dummyWallet = new SimpleWallet(Keypair.generate());
      
      this.provider = new AnchorProvider(
        this.connection,
        dummyWallet,
        { commitment: 'confirmed' }
      );

      const programId = process.env.NEXT_PUBLIC_PROGRAM_ID || '58Fg8uB36CJwb9gqGxSwmR8RYBWrXMwFbTRuW1694qcd';
      this.programReady = this.initializeProgram(programId);
    } else {
      this.programReady = Promise.resolve();
    }
  }

  private async initializeProgram(programId: string): Promise<void> {
    if (typeof window === 'undefined' || !this.provider) {
      return;
    }
    
    try {
      const idl = await this.loadIDL(programId);
      if (!idl) {
        console.warn('No IDL available for program initialization');
        return;
      }
      
      const convertedIdl = this.convertIdlFormat(idl, programId);
      
      try {
        this.program = new Program(
          convertedIdl as any,
          this.provider
        ) as any;
        this.isInitialized = true;
        console.log('Program initialized with IDL');
      } catch (programError) {
        console.warn('Could not initialize Program object, blockchain features will be limited:', programError);
        this.program = null;
      }
    } catch (error) {
      console.warn('Error during program initialization:', error);
      this.program = null;
    }
  }
  
  private convertIdlFormat(idl: any, programId: string): any {
    if (!idl.accounts) {
      return idl;
    }
    
    const converted = {
      ...idl,
      address: idl.address || programId,
      version: idl.version || "0.1.0",
      name: idl.name || idl.metadata?.name || "halo_protocol",
    };
    
    if (idl.accounts) {
      converted.accounts = idl.accounts.map((acc: any) => {
        const cleanAcc = { ...acc };
        if (cleanAcc.discriminator && Array.isArray(cleanAcc.discriminator)) {
          cleanAcc.discriminator = Buffer.from(cleanAcc.discriminator);
        }
        return cleanAcc;
      });
    }
    
    if (idl.instructions) {
      converted.instructions = idl.instructions.map((ix: any) => {
        const cleanIx = { ...ix };
        if (cleanIx.discriminator && Array.isArray(cleanIx.discriminator)) {
          cleanIx.discriminator = Buffer.from(cleanIx.discriminator);
        }
        return cleanIx;
      });
    }
    
    return converted;
  }

  async loadIDL(programId: string): Promise<any> {
    if (typeof window === 'undefined') {
      return null;
    }
    
    try {
      const response = await fetch('/halo_protocol.json');
      if (response.ok) {
        const fullIdl = await response.json();
        if (fullIdl && fullIdl.instructions && fullIdl.instructions.length > 0) {
          console.log('Loaded IDL from public directory');
          return fullIdl;
        }
      }
    } catch (error) {
      console.log('Could not load IDL from public directory:', error);
    }
    
    const fallbackProgramId = process.env.NEXT_PUBLIC_PROGRAM_ID || '58Fg8uB36CJwb9gqGxSwmR8RYBWrXMwFbTRuW1694qcd';
    return {
      "address": fallbackProgramId,
      "version": "0.1.0",
      "name": "halo_protocol",
      "metadata": {
        "name": "halo_protocol",
        "version": "0.1.0",
        "spec": "0.1.0"
      },
      "instructions": [],
      "accounts": [],
      "types": []
    };
  }

  getConnection(): Connection {
    return this.connection;
  }

  async ensureProgramReady(): Promise<void> {
    if (this.programReady) {
      await this.programReady;
    }
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
            offset: 8,
            bytes: circleAddress.toBase58()
          }
        }
      ]);
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  }

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

  async getRecentBlockhash() {
    return await this.connection.getRecentBlockhash();
  }

  async getSlot() {
    return await this.connection.getSlot();
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.connection.getVersion();
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  async checkProgramStatus(): Promise<{ exists: boolean; hasIdl: boolean; error?: string }> {
    try {
      const programId = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || '58Fg8uB36CJwb9gqGxSwmR8RYBWrXMwFbTRuW1694qcd');
      
      const programInfo = await this.connection.getAccountInfo(programId);
      if (!programInfo) {
        return { exists: false, hasIdl: false, error: 'Program not found on chain' };
      }

      if (this.provider) {
        try {
          const idl = await Program.fetchIdl(programId, this.provider);
          if (idl) {
            return { exists: true, hasIdl: true };
          }
        } catch (idlError) {
          console.log('IDL not found on-chain, checking local IDL');
        }
      }

      if (typeof window !== 'undefined') {
        try {
          const response = await fetch('/halo_protocol.json');
          if (response.ok) {
            const localIdl = await response.json();
            if (localIdl && localIdl.instructions && localIdl.instructions.length > 0) {
              console.log('Local IDL found and valid');
              return { exists: true, hasIdl: true };
            }
          }
        } catch (fetchError) {
          console.log('Could not load local IDL:', fetchError);
        }
      }

      if (this.program && this.program.idl) {
        return { exists: true, hasIdl: true };
      }

      return { exists: true, hasIdl: false, error: 'IDL not available - using mock data' };
    } catch (error) {
      return { exists: false, hasIdl: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

let solanaClientInstance: SolanaClient | null = null;

export function getSolanaClient(): SolanaClient {
  if (!solanaClientInstance) {
    solanaClientInstance = new SolanaClient();
  }
  return solanaClientInstance;
}

export const solanaClient = typeof window !== 'undefined' ? getSolanaClient() : null as any;
