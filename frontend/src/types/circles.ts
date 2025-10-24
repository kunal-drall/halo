export interface Circle {
  id: string;
  creator: string;
  contributionAmount: number;
  durationMonths: number;
  maxMembers: number;
  currentMembers: number;
  currentRound: number;
  status: 'Forming' | 'Active' | 'Completed' | 'Terminated';
  payoutMethod: 'FixedRotation' | 'Auction' | 'Random';
  minTrustTier: number;
  members: string[];
  payoutQueue: string[];
  insurancePool: string;
  totalYieldEarned: number;
  nextPayoutRecipient?: string;
  isPublic: boolean;
  circleType: 'Standard' | 'AuctionBased' | 'RandomRotation' | 'Hybrid';
  inviteCode?: string;
  escrowAccount: string;
  penaltyRate: number;
  totalPot: number;
  createdAt: number;
}

export interface Member {
  authority: string;
  circle: string;
  stakeAmount: number;
  contributionHistory: number[];
  payoutClaimed: boolean;
  payoutPosition: number;
  insuranceStaked: number;
  trustScore: number;
  trustTier: TrustTier;
  contributionRecords: ContributionRecord[];
  status: 'Active' | 'Defaulted' | 'Exited';
  hasReceivedPot: boolean;
  penalties: number;
  joinedAt: number;
  contributionsMissed: number;
}

export interface ContributionRecord {
  month: number;
  amount: number;
  timestamp: number;
  onTime: boolean;
  daysLate: number;
}

export enum TrustTier {
  Newcomer = 0,
  Silver = 1,
  Gold = 2,
  Platinum = 3,
}

export interface TrustScore {
  user: string;
  paymentReliability: number;
  circlesCompleted: number;
  circlesDefaulted: number;
  totalContributionsMade: number;
  onTimePayments: number;
  latePayments: number;
  overallScore: number;
  tier: TrustTier;
  lastUpdated: number;
}

export interface InsurancePool {
  circle: string;
  totalStaked: number;
  availableCoverage: number;
  claimsPaid: number;
  memberStakes: MemberStake[];
}

export interface MemberStake {
  member: string;
  amountStaked: number;
  canClaim: boolean;
}

export interface CircleEscrow {
  circle: string;
  totalAmount: number;
  monthlyPots: number[];
  totalYieldEarned: number;
  solendCTokenBalance: number;
  lastYieldCalculation: number;
  memberYieldShares: MemberYieldShare[];
}

export interface MemberYieldShare {
  member: string;
  yieldEarned: number;
  yieldClaimed: number;
}

export interface CreateCircleParams {
  contributionAmount: number;
  durationMonths: number;
  maxMembers: number;
  payoutMethod: 'FixedRotation' | 'Auction' | 'Random';
  minTrustTier: number;
  penaltyRate: number;
  isPublic: boolean;
  inviteCode?: string;
  circleType: 'Standard' | 'AuctionBased' | 'RandomRotation' | 'Hybrid';
}

export interface JoinCircleParams {
  circleId: string;
  insuranceAmount: number;
}

export interface ContributionParams {
  circleId: string;
  amount: number;
}

export interface PayoutClaimParams {
  circleId: string;
}

export interface BidParams {
  circleId: string;
  bidAmount: number;
}

export interface CircleFilters {
  minContribution?: number;
  maxContribution?: number;
  minTrustTier?: number;
  payoutMethod?: 'FixedRotation' | 'Auction' | 'Random';
  status?: 'Forming' | 'Active' | 'Completed';
  isPublic?: boolean;
}

export interface PaymentDue {
  circleId: string;
  circleName: string;
  amount: number;
  dueDate: number;
  daysUntilDue: number;
  isOverdue: boolean;
}

export interface PayoutReady {
  circleId: string;
  circleName: string;
  baseAmount: number;
  yieldShare: number;
  totalPayout: number;
  canClaim: boolean;
}

export interface CircleStats {
  totalCircles: number;
  activeCircles: number;
  totalMembers: number;
  totalValueLocked: number;
  totalYieldEarned: number;
  averageTrustScore: number;
}

export interface UserStats {
  circlesJoined: number;
  circlesCompleted: number;
  totalContributions: number;
  totalPayouts: number;
  totalYieldEarned: number;
  currentTrustScore: number;
  trustTier: TrustTier;
}

