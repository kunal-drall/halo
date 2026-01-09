// Re-export all types from circles.ts (comprehensive definitions)
export * from './circles'

// Additional types not in circles.ts

export interface SocialProof {
  type: 'Twitter' | 'Discord' | 'GitHub' | 'LinkedIn'
  identifier: string
  verified: boolean
  verifiedBy?: string
  verifiedAt?: Date
}

export interface LendingPosition {
  reserve: string
  amount: number
  apy: number
  type: 'deposit' | 'borrow'
  healthFactor?: number
}

export interface GovernanceProposal {
  id: string
  title: string
  description: string
  type: 'parameter' | 'upgrade' | 'treasury'
  status: 'draft' | 'active' | 'succeeded' | 'defeated' | 'queued' | 'executed'
  votesFor: number
  votesAgainst: number
  quorum: number
  startTime: Date
  endTime: Date
  creator: string
}

export interface Vote {
  proposalId: string
  voter: string
  support: boolean
  power: number
  timestamp: Date
}

export interface NetworkConfig {
  name: 'devnet' | 'mainnet-beta'
  rpcEndpoint: string
  programId: string
  solendMarket: string
}
