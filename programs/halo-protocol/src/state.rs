use anchor_lang::prelude::*;

#[account]
pub struct Circle {
    /// The creator of the circle
    pub creator: Pubkey,
    /// The unique identifier for the circle
    pub id: u64,
    /// Monthly contribution amount in lamports/tokens
    pub contribution_amount: u64,
    /// Duration of the circle in months
    pub duration_months: u8,
    /// Maximum number of members allowed
    pub max_members: u8,
    /// Current number of members
    pub current_members: u8,
    /// Current month (0-based)
    pub current_month: u8,
    /// Penalty rate in basis points (1% = 100)
    pub penalty_rate: u16,
    /// Status of the circle
    pub status: CircleStatus,
    /// Timestamp when circle was created
    pub created_at: i64,
    /// List of member public keys
    pub members: Vec<Pubkey>,
    /// Monthly contribution tracking
    pub monthly_contributions: Vec<MonthlyContribution>,
    /// Total pot amount collected so far
    pub total_pot: u64,
    /// Bump seed for PDA
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CircleStatus {
    Active,
    Completed,
    Terminated,
}

impl Default for CircleStatus {
    fn default() -> Self {
        CircleStatus::Active
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MonthlyContribution {
    pub month: u8,
    pub contributions: Vec<MemberContribution>,
    pub total_collected: u64,
    pub distributed_to: Option<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MemberContribution {
    pub member: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

#[account]
pub struct Member {
    /// The member's public key
    pub authority: Pubkey,
    /// The circle this member belongs to
    pub circle: Pubkey,
    /// Member's stake amount
    pub stake_amount: u64,
    /// Member's contribution history
    pub contribution_history: Vec<u64>, // Amount per month
    /// Member's status
    pub status: MemberStatus,
    /// Whether this member has received the pot
    pub has_received_pot: bool,
    /// Penalties accumulated
    pub penalties: u64,
    /// Timestamp when joined
    pub joined_at: i64,
    /// Bump seed for PDA
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum MemberStatus {
    Active,
    Defaulted,
    Exited,
}

impl Default for MemberStatus {
    fn default() -> Self {
        MemberStatus::Active
    }
}

#[account]
pub struct CircleEscrow {
    /// The circle this escrow belongs to
    pub circle: Pubkey,
    /// Total amount held in escrow
    pub total_amount: u64,
    /// Monthly pot amounts
    pub monthly_pots: Vec<u64>,
    /// Bump seed for PDA
    pub bump: u8,
}

impl Circle {
    pub const MAX_MEMBERS: usize = 20;
    pub const MAX_DURATION: u8 = 24; // months
    
    pub fn space() -> usize {
        8 + // discriminator
        32 + // creator
        8 + // id
        8 + // contribution_amount
        1 + // duration_months
        1 + // max_members
        1 + // current_members
        1 + // current_month
        2 + // penalty_rate
        1 + // status
        8 + // created_at
        4 + 32 * Self::MAX_MEMBERS + // members vec
        4 + (1 + 4 + (32 + 8 + 8) * Self::MAX_MEMBERS + 8 + 33) * Self::MAX_DURATION as usize + // monthly_contributions
        8 + // total_pot
        1 + // bump
        100 // extra space for future fields
    }
}

impl Member {
    pub fn space() -> usize {
        8 + // discriminator
        32 + // authority
        32 + // circle
        8 + // stake_amount
        4 + 8 * Circle::MAX_DURATION as usize + // contribution_history
        1 + // status
        1 + // has_received_pot
        8 + // penalties
        8 + // joined_at
        1 + // bump
        50 // extra space
    }
}

impl CircleEscrow {
    pub fn space() -> usize {
        8 + // discriminator
        32 + // circle
        8 + // total_amount
        4 + 8 * Circle::MAX_DURATION as usize + // monthly_pots
        1 + // bump
        50 // extra space
    }
}