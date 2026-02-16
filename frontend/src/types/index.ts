// Database types matching Supabase schema

export interface User {
  id: string;
  wallet_address: string;
  display_name: string | null;
  avatar_url: string | null;
  auth_provider: string | null;
  trust_score: number;
  trust_tier: TrustTier;
  trust_score_pda: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface Circle {
  id: string;
  on_chain_pubkey: string;
  creator_id: string;
  name: string | null;
  description: string | null;
  contribution_amount: number;
  token_mint: string;
  duration_months: number;
  max_members: number;
  penalty_rate: number;
  payout_method: PayoutMethod;
  min_trust_tier: TrustTier;
  is_public: boolean;
  invite_code: string | null;
  status: CircleStatus;
  current_members: number;
  current_month: number;
  total_pot: number;
  total_yield_earned: number;
  escrow_pubkey: string | null;
  insurance_pool_pubkey: string | null;
  created_at: string;
  updated_at: string;
}

export interface CircleMember {
  id: string;
  circle_id: string;
  user_id: string;
  member_pda: string | null;
  status: MemberStatus;
  stake_amount: number;
  insurance_staked: number;
  payout_position: number | null;
  has_received_pot: boolean;
  penalties: number;
  contributions_missed: number;
  trust_score_at_join: number;
  joined_at: string;
  // Joined data
  user?: User;
}

export interface Contribution {
  id: string;
  circle_id: string;
  user_id: string;
  month: number;
  amount: number;
  on_time: boolean;
  days_late: number;
  tx_signature: string;
  created_at: string;
}

export interface Payout {
  id: string;
  circle_id: string;
  recipient_id: string;
  month: number;
  gross_amount: number;
  fee_amount: number;
  net_amount: number;
  yield_share: number;
  payout_method: PayoutMethod | null;
  tx_signature: string | null;
  created_at: string;
}

export interface Proposal {
  id: string;
  on_chain_pubkey: string | null;
  circle_id: string;
  proposer_id: string;
  title: string;
  description: string | null;
  proposal_type: string;
  status: ProposalStatus;
  voting_end: string;
  votes_for: number;
  votes_against: number;
  executed: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  circle_id: string | null;
  action: string;
  details: Record<string, unknown> | null;
  tx_signature: string | null;
  created_at: string;
}

// Enums
export type TrustTier = "newcomer" | "silver" | "gold" | "platinum";
export type CircleStatus = "forming" | "active" | "distributing" | "completed" | "dissolved";
export type MemberStatus = "active" | "defaulted" | "left" | "removed";
export type PayoutMethod = "fixed_rotation" | "random" | "auction";
export type ProposalStatus = "active" | "passed" | "rejected" | "executed" | "expired";
export type NotificationType =
  | "contribution_reminder_3d"
  | "contribution_reminder_1d"
  | "contribution_overdue"
  | "contribution_received"
  | "payout_your_turn"
  | "payout_distributed"
  | "member_joined"
  | "member_defaulted"
  | "trust_score_updated"
  | "circle_completed"
  | "proposal_created"
  | "insurance_claimed";

// API response types
export interface TransactionResponse {
  transaction: string; // base64 serialized unsigned transaction
  pdaAddress?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}

// Circle with expanded relations
export interface CircleWithMembers extends Circle {
  members: CircleMember[];
  creator?: User;
}

// Trust score breakdown
export interface TrustScoreBreakdown {
  score: number;
  tier: TrustTier;
  payment_score: number;
  completion_score: number;
  defi_score: number;
  social_score: number;
  circles_completed: number;
  on_time_payments: number;
  total_payments: number;
}

// User stats for dashboard
export interface UserStats {
  active_circles: number;
  total_contributed: number;
  total_received: number;
  total_yield_earned: number;
  trust_score: number;
  trust_tier: TrustTier;
}
