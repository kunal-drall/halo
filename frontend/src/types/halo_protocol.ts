// Generated TypeScript types for Halo Protocol
// Program ID: 9KmMjZrsvTdRnfr2dZerby2d5f6tjyPZwViweQxV2FnR
import { PublicKey } from "@solana/web3.js";
import { BN, Idl } from "@coral-xyz/anchor";

export type ProgramId = "9KmMjZrsvTdRnfr2dZerby2d5f6tjyPZwViweQxV2FnR";

// Anchor Program Type - using Idl for compatibility
export type HaloProtocolProgram = Idl;

// Instruction Types
export type initialize_circleInstruction = {
  accounts: {
    circle: PublicKey;
    escrow: PublicKey;
    creator: PublicKey;
    system_program: PublicKey;
  };
  args: {
    contribution_amount: BN;
    duration_months: number;
    max_members: number;
    penalty_rate: number;
  };
};

export type join_circleInstruction = {
  accounts: {
    circle: PublicKey;
    member: PublicKey;
    escrow: PublicKey;
    member_authority: PublicKey;
    system_program: PublicKey;
  };
  args: {
    stake_amount: BN;
  };
};

export type contributeInstruction = {
  accounts: {
    circle: PublicKey;
    member: PublicKey;
    escrow: PublicKey;
    member_authority: PublicKey;
  };
  args: {
    amount: BN;
  };
};

export type distribute_potInstruction = {
  accounts: {
    circle: PublicKey;
    recipient_member: PublicKey;
    escrow: PublicKey;
    authority: PublicKey;
  };
  args: {
  };
};

export type claim_penaltyInstruction = {
  accounts: {
    circle: PublicKey;
    defaulted_member: PublicKey;
    escrow: PublicKey;
    authority: PublicKey;
  };
  args: {
  };
};

export type leave_circleInstruction = {
  accounts: {
    circle: PublicKey;
    member: PublicKey;
    escrow: PublicKey;
    member_authority: PublicKey;
  };
  args: {
  };
};

export type initialize_trust_scoreInstruction = {
  accounts: {
    trust_score: PublicKey;
    authority: PublicKey;
    system_program: PublicKey;
  };
  args: {
  };
};

export type update_trust_scoreInstruction = {
  accounts: {
    trust_score: PublicKey;
    authority: PublicKey;
  };
  args: {
  };
};

export type add_social_proofInstruction = {
  accounts: {
    trust_score: PublicKey;
    authority: PublicKey;
  };
  args: {
    proof_type: string;
    identifier: string;
  };
};

