export interface Circle {
  publicKey: string
  creator: string
  contributionAmount: number
  durationMonths: number
  maxMembers: number
  currentMembers: number
  penaltyRate: number
  totalPot: number
  currentMonth: number
  status: 'active' | 'completed' | 'paused'
  members: Member[]
  createdAt: Date
}

export interface Member {
  publicKey: string
  walletAddress: string
  hasContributed: boolean
  hasReceivedPot: boolean
  trustScore: number
  joinedAt: Date
  stakeAmount: number
}

export interface TrustScore {
  publicKey: string
  baseScore: number
  socialProofs: SocialProof[]
  defiActivityScore: number
  contributionHistory: number
  completedCircles: number
  tier: 'Newcomer' | 'Silver' | 'Gold' | 'Platinum'
  totalScore: number
}

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