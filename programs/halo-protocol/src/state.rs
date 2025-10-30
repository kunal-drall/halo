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
    /// ROSCA-specific fields
    /// Payout method for the circle
    pub payout_method: PayoutMethod,
    /// Order of payout recipients
    pub payout_queue: Vec<Pubkey>,
    /// Minimum trust tier required to join
    pub min_trust_tier: u8,
    /// Insurance pool account
    pub insurance_pool: Pubkey,
    /// Circle type (Standard, Auction, Random, Hybrid)
    pub circle_type: CircleType,
    /// Invite code for private circles
    pub invite_code: Option<String>,
    /// Whether circle is public
    pub is_public: bool,
    /// Escrow account for pooled funds
    pub escrow_account: Pubkey,
    /// Total yield earned from DeFi
    pub total_yield_earned: u64,
    /// Next payout recipient
    pub next_payout_recipient: Option<Pubkey>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CircleStatus {
    Forming,    // Accepting members
    Active,     // Running
    Completed,  // Finished
    Terminated, // Has defaults
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PayoutMethod {
    FixedRotation,
    Auction,
    Random,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum CircleType {
    Standard,
    AuctionBased,
    RandomRotation,
    Hybrid,
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

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ContributionRecord {
    pub month: u8,
    pub amount: u64,
    pub timestamp: i64,
    pub on_time: bool,
    pub days_late: u8,
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
    /// Current trust score (cached for quick access)
    pub trust_score: u16,
    /// Trust tier (cached for quick access)
    pub trust_tier: TrustTier,
    /// Number of contributions missed in this circle
    pub contributions_missed: u8,
    /// Bump seed for PDA
    pub bump: u8,
    /// ROSCA-specific fields
    /// Whether member has claimed payout
    pub payout_claimed: bool,
    /// Position in payout queue
    pub payout_position: u8,
    /// Insurance amount staked
    pub insurance_staked: u64,
    /// Detailed contribution records
    pub contribution_records: Vec<ContributionRecord>,
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
    /// ROSCA-specific fields
    /// Total yield earned from DeFi
    pub total_yield_earned: u64,
    /// Solend cToken balance
    pub solend_c_token_balance: u64,
    /// Last yield calculation timestamp
    pub last_yield_calculation: i64,
    /// Yield distribution per member
    pub member_yield_shares: Vec<MemberYieldShare>,
    /// REFLECT INTEGRATION: Dual yield tracking
    /// Yield earned from Reflect price appreciation
    pub reflect_yield_earned: u64,
    /// Yield earned from Solend lending
    pub solend_yield_earned: u64,
    /// Reflect token type used (USDC+ or USDJ)
    pub reflect_token_type: Option<ReflectTokenType>,
    /// Initial Reflect price at deposit
    pub reflect_initial_price: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MemberYieldShare {
    pub member: Pubkey,
    pub yield_earned: u64,
    pub yield_claimed: u64,
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
        2 + // trust_score
        1 + // trust_tier
        1 + // contributions_missed
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
        8 + // total_yield_earned
        8 + // solend_c_token_balance
        8 + // last_yield_calculation
        4 + (32 + 8 + 8) * Circle::MAX_MEMBERS + // member_yield_shares
        8 + // reflect_yield_earned
        8 + // solend_yield_earned
        2 + // reflect_token_type (Option<enum>)
        8 + // reflect_initial_price
        100 // extra space
    }

    /// Calculate total yield from both Reflect and Solend
    pub fn calculate_total_dual_yield(&self) -> u64 {
        self.reflect_yield_earned.saturating_add(self.solend_yield_earned)
    }

    /// Get combined APY from both sources (returns basis points)
    pub fn get_combined_apy(&self, current_time: i64) -> u64 {
        if self.last_yield_calculation == 0 || current_time <= self.last_yield_calculation {
            return 0;
        }

        let time_elapsed = current_time - self.last_yield_calculation;
        let total_yield = self.calculate_total_dual_yield();

        if self.total_amount == 0 {
            return 0;
        }

        // Annualize the return
        let seconds_per_year = 31_536_000_i64; // 365 days
        let annualized_yield = (total_yield as u128)
            .saturating_mul(seconds_per_year as u128)
            .checked_div(time_elapsed as u128)
            .unwrap_or(0) as u64;

        // Return APY in basis points (1% = 100 bps)
        annualized_yield
            .saturating_mul(10_000)
            .checked_div(self.total_amount)
            .unwrap_or(0)
    }

    /// Get Reflect-specific APY (returns basis points)
    pub fn get_reflect_apy(&self, current_time: i64) -> u64 {
        if self.last_yield_calculation == 0 || current_time <= self.last_yield_calculation {
            return 0;
        }

        let time_elapsed = current_time - self.last_yield_calculation;

        if self.total_amount == 0 {
            return 0;
        }

        let seconds_per_year = 31_536_000_i64;
        let annualized_yield = (self.reflect_yield_earned as u128)
            .saturating_mul(seconds_per_year as u128)
            .checked_div(time_elapsed as u128)
            .unwrap_or(0) as u64;

        annualized_yield
            .saturating_mul(10_000)
            .checked_div(self.total_amount)
            .unwrap_or(0)
    }

    /// Get Solend-specific APY (returns basis points)
    pub fn get_solend_apy(&self, current_time: i64) -> u64 {
        if self.last_yield_calculation == 0 || current_time <= self.last_yield_calculation {
            return 0;
        }

        let time_elapsed = current_time - self.last_yield_calculation;

        if self.total_amount == 0 {
            return 0;
        }

        let seconds_per_year = 31_536_000_i64;
        let annualized_yield = (self.solend_yield_earned as u128)
            .saturating_mul(seconds_per_year as u128)
            .checked_div(time_elapsed as u128)
            .unwrap_or(0) as u64;

        annualized_yield
            .saturating_mul(10_000)
            .checked_div(self.total_amount)
            .unwrap_or(0)
    }
}

#[account]
pub struct TrustScore {
    /// The user's public key
    pub authority: Pubkey,
    /// Overall trust score (0-1000)
    pub score: u16,
    /// Current trust tier
    pub tier: TrustTier,
    /// Payment history score component (0-400, representing 40%)
    pub payment_history_score: u16,
    /// Circle completion score component (0-300, representing 30%)
    pub completion_score: u16,
    /// DeFi activity score component (0-200, representing 20%)
    pub defi_activity_score: u16,
    /// Social proof score component (0-100, representing 10%)
    pub social_proof_score: u16,
    /// Number of circles completed successfully
    pub circles_completed: u16,
    /// Total number of circles joined
    pub circles_joined: u16,
    /// Total contributions made across all circles
    pub total_contributions: u64,
    /// Number of missed contributions
    pub missed_contributions: u16,
    /// Social proofs attached to this user
    pub social_proofs: Vec<SocialProof>,
    /// Last time trust score was updated
    pub last_updated: i64,
    /// Bump seed for PDA
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, Debug)]
pub enum TrustTier {
    Newcomer,   // 0-249 score
    Silver,     // 250-499 score
    Gold,       // 500-749 score
    Platinum,   // 750-1000 score
}

impl Default for TrustTier {
    fn default() -> Self {
        TrustTier::Newcomer
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct SocialProof {
    /// Type of social proof (Twitter, Discord, etc.)
    pub proof_type: String,
    /// Verification data or identifier
    pub identifier: String,
    /// Whether this proof is verified
    pub verified: bool,
    /// Timestamp when proof was added
    pub timestamp: i64,
}

impl TrustScore {
    pub const MAX_SOCIAL_PROOFS: usize = 5;
    
    pub fn space() -> usize {
        8 + // discriminator
        32 + // authority
        2 + // score
        1 + // tier
        2 + // payment_history_score
        2 + // completion_score
        2 + // defi_activity_score
        2 + // social_proof_score
        2 + // circles_completed
        2 + // circles_joined
        8 + // total_contributions
        2 + // missed_contributions
        4 + (4 + 32 + 4 + 32 + 1 + 8) * Self::MAX_SOCIAL_PROOFS + // social_proofs vec
        8 + // last_updated
        1 + // bump
        100 // extra space
    }

    /// Calculate minimum stake requirement based on trust tier
    pub fn get_minimum_stake_multiplier(&self) -> u64 {
        match self.tier {
            TrustTier::Newcomer => 200, // 2x base stake
            TrustTier::Silver => 150,   // 1.5x base stake
            TrustTier::Gold => 100,     // 1x base stake
            TrustTier::Platinum => 75,  // 0.75x base stake
        }
    }

    /// Update trust tier based on current score
    pub fn update_tier(&mut self) {
        self.tier = match self.score {
            0..=249 => TrustTier::Newcomer,
            250..=499 => TrustTier::Silver,
            500..=749 => TrustTier::Gold,
            750..=1000 => TrustTier::Platinum,
            _ => TrustTier::Newcomer, // Default fallback
        };
    }

    /// Calculate and update trust score components
    pub fn calculate_score(&mut self) {
        // Payment history score (40% weight, max 400 points)
        let payment_ratio = if self.circles_joined > 0 {
            let total_expected = self.circles_joined * 12; // Assume 12 month average
            let success_rate = if total_expected > self.missed_contributions {
                ((total_expected - self.missed_contributions) * 100) / total_expected
            } else { 0 };
            std::cmp::min(success_rate, 100)
        } else { 0 };
        self.payment_history_score = ((payment_ratio as u16 * 400) / 100).min(400);

        // Circle completion score (30% weight, max 300 points)
        let completion_ratio = if self.circles_joined > 0 {
            (self.circles_completed * 100) / self.circles_joined
        } else { 0 };
        self.completion_score = ((completion_ratio * 300) / 100).min(300);

        // DeFi activity score (20% weight, max 200 points) - placeholder implementation
        self.defi_activity_score = std::cmp::min(self.defi_activity_score, 200);

        // Social proof score (10% weight, max 100 points)
        let verified_proofs = self.social_proofs.iter().filter(|p| p.verified).count();
        self.social_proof_score = std::cmp::min((verified_proofs * 20) as u16, 100);

        // Calculate total score
        self.score = self.payment_history_score + 
                    self.completion_score + 
                    self.defi_activity_score + 
                    self.social_proof_score;
        
        self.update_tier();
    }
}

// Switchboard Oracle Automation Structures

/// Global automation configuration and state
#[account]
pub struct AutomationState {
    /// Authority that can update automation settings
    pub authority: Pubkey,
    /// Switchboard queue account for automation jobs
    pub switchboard_queue: Pubkey,
    /// Automation enabled flag
    pub enabled: bool,
    /// Number of active automation jobs
    pub active_jobs: u32,
    /// Minimum interval between automation checks (in seconds)
    pub min_interval: i64,
    /// Last global automation check timestamp
    pub last_check: i64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl AutomationState {
    pub const SPACE: usize = 8 + // discriminator
        32 + // authority
        32 + // switchboard_queue
        1 + // enabled
        4 + // active_jobs
        8 + // min_interval
        8 + // last_check
        1 + // bump
        50; // padding
}

/// Per-circle automation configuration
#[account]
pub struct CircleAutomation {
    /// The circle this automation belongs to
    pub circle: Pubkey,
    /// Switchboard job account for this circle
    pub job_account: Pubkey,
    /// Whether contribution collection is automated
    pub auto_collect_enabled: bool,
    /// Whether payout distribution is automated
    pub auto_distribute_enabled: bool,
    /// Whether penalty enforcement is automated
    pub auto_penalty_enabled: bool,
    /// Monthly contribution collection schedule (unix timestamp)
    pub contribution_schedule: Vec<i64>,
    /// Distribution schedule (unix timestamp)
    pub distribution_schedule: Vec<i64>,
    /// Penalty check schedule (unix timestamp)
    pub penalty_schedule: Vec<i64>,
    /// Last contribution collection timestamp
    pub last_contribution_check: i64,
    /// Last distribution timestamp
    pub last_distribution_check: i64,
    /// Last penalty check timestamp
    pub last_penalty_check: i64,
    /// Circle created at timestamp (for calculations)
    pub circle_created_at: i64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl CircleAutomation {
    pub const MAX_SCHEDULE_ITEMS: usize = 36; // 3 years worth of monthly events
    
    pub const SPACE: usize = 8 + // discriminator
        32 + // circle
        32 + // job_account
        1 + // auto_collect_enabled
        1 + // auto_distribute_enabled  
        1 + // auto_penalty_enabled
        4 + (8 * Self::MAX_SCHEDULE_ITEMS) + // contribution_schedule
        4 + (8 * Self::MAX_SCHEDULE_ITEMS) + // distribution_schedule
        4 + (8 * Self::MAX_SCHEDULE_ITEMS) + // penalty_schedule
        8 + // last_contribution_check
        8 + // last_distribution_check
        8 + // last_penalty_check
        8 + // circle_created_at
        1 + // bump
        100; // padding
    
    /// Generate contribution schedule for a circle
    pub fn generate_contribution_schedule(created_at: i64, duration_months: u8) -> Vec<i64> {
        let mut schedule = Vec::new();
        let month_duration = 30 * 24 * 60 * 60; // 30 days in seconds
        
        for month in 0..duration_months {
            let contribution_time = created_at + (month as i64 * month_duration);
            schedule.push(contribution_time);
        }
        
        schedule
    }
    
    /// Generate distribution schedule for a circle
    pub fn generate_distribution_schedule(created_at: i64, duration_months: u8) -> Vec<i64> {
        let mut schedule = Vec::new();
        let month_duration = 30 * 24 * 60 * 60;
        let distribution_offset = 25 * 24 * 60 * 60; // 25 days into each month
        
        for month in 0..duration_months {
            let distribution_time = created_at + (month as i64 * month_duration) + distribution_offset;
            schedule.push(distribution_time);
        }
        
        schedule
    }
    
    /// Generate penalty check schedule for a circle  
    pub fn generate_penalty_schedule(created_at: i64, duration_months: u8) -> Vec<i64> {
        let mut schedule = Vec::new();
        let month_duration = 30 * 24 * 60 * 60;
        let penalty_offset = 27 * 24 * 60 * 60; // 27 days into each month
        
        for month in 0..duration_months {
            let penalty_time = created_at + (month as i64 * month_duration) + penalty_offset;
            schedule.push(penalty_time);
        }
        
        schedule
    }
    
    /// Check if it's time for contribution collection
    pub fn should_collect_contributions(&self, current_time: i64) -> bool {
        if !self.auto_collect_enabled {
            return false;
        }
        
        for &scheduled_time in &self.contribution_schedule {
            if current_time >= scheduled_time && self.last_contribution_check < scheduled_time {
                return true;
            }
        }
        
        false
    }
    
    /// Check if it's time for payout distribution
    pub fn should_distribute_payouts(&self, current_time: i64) -> bool {
        if !self.auto_distribute_enabled {
            return false;
        }
        
        for &scheduled_time in &self.distribution_schedule {
            if current_time >= scheduled_time && self.last_distribution_check < scheduled_time {
                return true;
            }
        }
        
        false
    }
    
    /// Check if it's time for penalty enforcement
    pub fn should_enforce_penalties(&self, current_time: i64) -> bool {
        if !self.auto_penalty_enabled {
            return false;
        }
        
        for &scheduled_time in &self.penalty_schedule {
            if current_time >= scheduled_time && self.last_penalty_check < scheduled_time {
                return true;
            }
        }
        
        false
    }
}

/// Event log for automation actions
#[account]
pub struct AutomationEvent {
    /// The circle this event relates to
    pub circle: Pubkey,
    /// Type of automation event
    pub event_type: AutomationEventType,
    /// Timestamp when event occurred
    pub timestamp: i64,
    /// Event details/data
    pub data: Vec<u8>,
    /// Whether event was successful
    pub success: bool,
    /// Error message if failed
    pub error_message: Option<String>,
    /// Bump seed for PDA
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum AutomationEventType {
    ContributionCollection,
    PayoutDistribution, 
    PenaltyEnforcement,
    ScheduleUpdate,
}

impl AutomationEvent {
    pub const SPACE: usize = 8 + // discriminator
        32 + // circle
        1 + // event_type
        8 + // timestamp
        4 + 100 + // data vec (max 100 bytes)
        1 + // success
        4 + 100 + // error_message (max 100 chars)
        1 + // bump
        50; // padding
}

// Revenue Module Structures

/// Global treasury account that holds all protocol fees
#[account]
pub struct Treasury {
    /// Authority that can manage treasury (should be governance)
    pub authority: Pubkey,
    /// Total fees collected across all categories
    pub total_fees_collected: u64,
    /// Fees from loan distributions (0.5%)
    pub distribution_fees: u64,
    /// Fees from interest yield (0.25%)
    pub yield_fees: u64,
    /// Management fees from staked amounts (2% annual)
    pub management_fees: u64,
    /// Last time management fees were collected
    pub last_management_fee_collection: i64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl Treasury {
    pub const SPACE: usize = 8 + // discriminator
        32 + // authority
        8 + // total_fees_collected
        8 + // distribution_fees
        8 + // yield_fees
        8 + // management_fees
        8 + // last_management_fee_collection
        1 + // bump
        100; // padding
}

/// Revenue parameters that can be adjusted by governance
#[account]
pub struct RevenueParams {
    /// Authority that can update parameters (governance)
    pub authority: Pubkey,
    /// Distribution fee rate in basis points (default: 50 = 0.5%)
    pub distribution_fee_rate: u16,
    /// Yield fee rate in basis points (default: 25 = 0.25%)
    pub yield_fee_rate: u16,
    /// Annual management fee rate in basis points (default: 200 = 2%)
    pub management_fee_rate: u16,
    /// Minimum interval between management fee collections (seconds)
    pub management_fee_interval: i64,
    /// Last time parameters were updated
    pub last_updated: i64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl RevenueParams {
    pub const SPACE: usize = 8 + // discriminator
        32 + // authority
        2 + // distribution_fee_rate
        2 + // yield_fee_rate
        2 + // management_fee_rate
        8 + // management_fee_interval
        8 + // last_updated
        1 + // bump
        50; // padding
    
    /// Default revenue parameters
    pub fn default_params() -> (u16, u16, u16, i64) {
        (50, 25, 200, 30 * 24 * 60 * 60) // 0.5%, 0.25%, 2%, 30 days interval
    }
    
    /// Calculate distribution fee amount
    pub fn calculate_distribution_fee(&self, amount: u64) -> Result<u64> {
        amount
            .checked_mul(self.distribution_fee_rate as u64)
            .and_then(|result| result.checked_div(10000))
            .ok_or_else(|| anchor_lang::error!(crate::errors::HaloError::ArithmeticOverflow))
    }
    
    /// Calculate yield fee amount
    pub fn calculate_yield_fee(&self, amount: u64) -> Result<u64> {
        amount
            .checked_mul(self.yield_fee_rate as u64)
            .and_then(|result| result.checked_div(10000))
            .ok_or_else(|| anchor_lang::error!(crate::errors::HaloError::ArithmeticOverflow))
    }
    
    /// Calculate annual management fee for a given stake amount and time period
    pub fn calculate_management_fee(&self, stake_amount: u64, time_elapsed_seconds: i64) -> Result<u64> {
        let annual_fee = stake_amount
            .checked_mul(self.management_fee_rate as u64)
            .and_then(|result| result.checked_div(10000))
            .ok_or_else(|| anchor_lang::error!(crate::errors::HaloError::ArithmeticOverflow))?;
        
        let seconds_in_year = 365 * 24 * 60 * 60;
        annual_fee
            .checked_mul(time_elapsed_seconds as u64)
            .and_then(|result| result.checked_div(seconds_in_year))
            .ok_or_else(|| anchor_lang::error!(crate::errors::HaloError::ArithmeticOverflow))
    }
}

/// Revenue report structure for tracking and analytics
#[account]
pub struct RevenueReport {
    /// Period start timestamp
    pub period_start: i64,
    /// Period end timestamp
    pub period_end: i64,
    /// Total fees collected in this period
    pub total_period_fees: u64,
    /// Distribution fees in this period
    pub period_distribution_fees: u64,
    /// Yield fees in this period
    pub period_yield_fees: u64,
    /// Management fees in this period
    pub period_management_fees: u64,
    /// Number of circles active in this period
    pub active_circles: u32,
    /// Total amount distributed in this period
    pub total_distributions: u64,
    /// Total yield generated in this period
    pub total_yield: u64,
    /// Total stake amount subject to management fees
    pub total_managed_stake: u64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl RevenueReport {
    pub const SPACE: usize = 8 + // discriminator
        8 + // period_start
        8 + // period_end
        8 + // total_period_fees
        8 + // period_distribution_fees
        8 + // period_yield_fees
        8 + // period_management_fees
        4 + // active_circles
        8 + // total_distributions
        8 + // total_yield
        8 + // total_managed_stake
        1 + // bump
        50; // padding
}// Governance and Auction System

#[account]
pub struct GovernanceProposal {
    /// Proposal ID
    pub id: u64,
    /// The circle this proposal affects
    pub circle: Pubkey,
    /// Proposal creator
    pub proposer: Pubkey,
    /// Proposal title
    pub title: String,
    /// Proposal description
    pub description: String,
    /// Proposal type
    pub proposal_type: ProposalType,
    /// Current proposal status
    pub status: ProposalStatus,
    /// Voting start time
    pub voting_start: i64,
    /// Voting end time
    pub voting_end: i64,
    /// Minimum voting power required for execution
    pub execution_threshold: u64,
    /// Total voting power for this proposal
    pub total_voting_power: u64,
    /// Total votes in favor (raw vote count)
    pub votes_for: u64,
    /// Total votes against (raw vote count)
    pub votes_against: u64,
    /// Quadratic weighted votes for
    pub quadratic_votes_for: u64,
    /// Quadratic weighted votes against
    pub quadratic_votes_against: u64,
    /// Has this proposal been executed
    pub executed: bool,
    /// Execution timestamp
    pub executed_at: Option<i64>,
    /// New interest rate (for interest rate proposals)
    pub new_interest_rate: Option<u16>,
    /// Bump seed for PDA
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalType {
    InterestRateChange,
    CircleParameter,
    Emergency,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ProposalStatus {
    Active,
    Succeeded,
    Defeated,
    Executed,
    Cancelled,
}

impl Default for ProposalStatus {
    fn default() -> Self {
        ProposalStatus::Active
    }
}

#[account]
pub struct Vote {
    /// The proposal this vote is for
    pub proposal: Pubkey,
    /// The voter
    pub voter: Pubkey,
    /// Voting power used
    pub voting_power: u64,
    /// Quadratic voting weight (square root of voting power)
    pub quadratic_weight: u64,
    /// Vote direction (true = for, false = against)
    pub support: bool,
    /// When the vote was cast
    pub timestamp: i64,
    /// Bump seed for PDA
    pub bump: u8,
}

#[account]
pub struct Auction {
    /// Auction ID
    pub id: u64,
    /// The circle this auction is for
    pub circle: Pubkey,
    /// The member who initiated the auction
    pub initiator: Pubkey,
    /// Current month's pot amount being auctioned
    pub pot_amount: u64,
    /// Starting bid amount
    pub starting_bid: u64,
    /// Current highest bid
    pub highest_bid: u64,
    /// Current highest bidder
    pub highest_bidder: Option<Pubkey>,
    /// Auction start time
    pub start_time: i64,
    /// Auction end time
    pub end_time: i64,
    /// Auction status
    pub status: AuctionStatus,
    /// Whether the auction has been settled
    pub settled: bool,
    /// Total number of bids placed
    pub bid_count: u32,
    /// Bump seed for PDA
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum AuctionStatus {
    Active,
    Ended,
    Cancelled,
}

impl Default for AuctionStatus {
    fn default() -> Self {
        AuctionStatus::Active
    }
}

#[account]
pub struct Bid {
    /// The auction this bid is for
    pub auction: Pubkey,
    /// The bidder
    pub bidder: Pubkey,
    /// Bid amount
    pub amount: u64,
    /// Bidder's stake at time of bid
    pub bidder_stake: u64,
    /// When the bid was placed
    pub timestamp: i64,
    /// Whether this bid is currently the highest
    pub is_highest: bool,
    /// Bump seed for PDA
    pub bump: u8,
}

impl GovernanceProposal {
    pub const MAX_TITLE_LENGTH: usize = 200;
    pub const MAX_DESCRIPTION_LENGTH: usize = 1000;
    
    pub fn space() -> usize {
        8 + // discriminator
        8 + // id
        32 + // circle
        32 + // proposer
        4 + Self::MAX_TITLE_LENGTH + // title
        4 + Self::MAX_DESCRIPTION_LENGTH + // description
        1 + // proposal_type
        1 + // status
        8 + // voting_start
        8 + // voting_end
        8 + // execution_threshold
        8 + // total_voting_power
        8 + // votes_for
        8 + // votes_against
        8 + // quadratic_votes_for
        8 + // quadratic_votes_against
        1 + // executed
        1 + 8 + // executed_at (Option<i64>)
        1 + 2 + // new_interest_rate (Option<u16>)
        1 + // bump
        100 // extra space
    }

    /// Check if proposal is currently active for voting
    pub fn is_active(&self) -> bool {
        self.status == ProposalStatus::Active
    }

    /// Check if voting period has ended
    pub fn voting_ended(&self, current_time: i64) -> bool {
        current_time >= self.voting_end
    }

    /// Calculate if proposal has enough votes to pass
    pub fn has_passed(&self) -> bool {
        self.quadratic_votes_for > self.quadratic_votes_against &&
        self.total_voting_power >= self.execution_threshold
    }
}

impl Vote {
    pub fn space() -> usize {
        8 + // discriminator
        32 + // proposal
        32 + // voter
        8 + // voting_power
        8 + // quadratic_weight
        1 + // support
        8 + // timestamp
        1 + // bump
        50 // extra space
    }
}

impl Auction {
    pub fn space() -> usize {
        8 + // discriminator
        8 + // id
        32 + // circle
        32 + // initiator
        8 + // pot_amount
        8 + // starting_bid
        8 + // highest_bid
        1 + 32 + // highest_bidder (Option<Pubkey>)
        8 + // start_time
        8 + // end_time
        1 + // status
        1 + // settled
        4 + // bid_count
        1 + // bump
        50 // extra space
    }

    /// Check if auction is currently active
    pub fn is_active(&self, current_time: i64) -> bool {
        self.status == AuctionStatus::Active && 
        current_time >= self.start_time && 
        current_time < self.end_time
    }

    /// Check if auction has ended
    pub fn has_ended(&self, current_time: i64) -> bool {
        current_time >= self.end_time || self.status == AuctionStatus::Ended
    }
}

impl Bid {
    pub fn space() -> usize {
        8 + // discriminator
        32 + // auction
        32 + // bidder
        8 + // amount
        8 + // bidder_stake
        8 + // timestamp
        1 + // is_highest
        1 + // bump
        50 // extra space
    }
}

// ============================================================================
// ARCIUM PRIVACY INTEGRATION
// ============================================================================

/// Privacy mode for circles and trust scores
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PrivacyMode {
    Public,          // All data visible
    Anonymous,       // Member identities hidden
    FullyEncrypted,  // All data encrypted via Arcium MPC
}

impl Default for PrivacyMode {
    fn default() -> Self {
        PrivacyMode::Public
    }
}

/// Encrypted trust score using Arcium MPC
/// Trust score calculations happen in encrypted environment,
/// only final score is revealed
#[account]
pub struct EncryptedTrustScore {
    /// The user's public key
    pub authority: Pubkey,
    /// Encrypted score data (calculated in Arcium MPC)
    pub encrypted_score: Vec<u8>,
    /// Reference to Arcium computation key
    pub arcium_compute_key: Pubkey,
    /// Whether privacy is enabled
    pub privacy_enabled: bool,
    /// Last time the score was updated
    pub last_updated: i64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl EncryptedTrustScore {
    pub fn space() -> usize {
        8 + // discriminator
        32 + // authority
        4 + 256 + // encrypted_score (vec with max 256 bytes)
        32 + // arcium_compute_key
        1 + // privacy_enabled
        8 + // last_updated
        1 + // bump
        50 // extra space
    }
}

/// Private circle with Arcium privacy features
/// Supports anonymous participation and encrypted member data
#[account]
pub struct PrivateCircle {
    /// The circle this privacy config belongs to
    pub circle: Pubkey,
    /// Privacy mode setting
    pub privacy_mode: PrivacyMode,
    /// Arcium session key for this circle's encryption
    pub arcium_session: Pubkey,
    /// Encrypted member information
    pub encrypted_member_data: Vec<EncryptedMemberInfo>,
    /// Whether to allow public statistics (even in private mode)
    pub allow_public_stats: bool,
    /// Bump seed for PDA
    pub bump: u8,
}

impl PrivateCircle {
    pub const MAX_MEMBERS: usize = 20;

    pub fn space() -> usize {
        8 + // discriminator
        32 + // circle
        1 + // privacy_mode
        32 + // arcium_session
        4 + (32 + 4 + 256 + 1) * Self::MAX_MEMBERS + // encrypted_member_data vec
        1 + // allow_public_stats
        1 + // bump
        100 // extra space
    }
}

/// Encrypted member information for anonymous circles
#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct EncryptedMemberInfo {
    /// Anonymous member ID (e.g., "Member #1")
    pub member_id: String,
    /// Encrypted wallet address
    pub encrypted_wallet: Vec<u8>,
    /// Public payment status (true if current on payments)
    pub payment_status_current: bool,
}

/// Encrypted bid for sealed-bid auctions
#[account]
pub struct SealedBid {
    /// The auction this bid belongs to
    pub auction: Pubkey,
    /// Encrypted bid data
    pub sealed_bid_data: Vec<u8>,
    /// Commitment hash for verification
    pub commitment_hash: [u8; 32],
    /// Bidder's commitment (like a bid bond)
    pub bidder_commitment: Pubkey,
    /// Timestamp when bid was placed
    pub timestamp: i64,
    /// Whether bid has been revealed
    pub is_revealed: bool,
    /// Bump seed for PDA
    pub bump: u8,
}

impl SealedBid {
    pub fn space() -> usize {
        8 + // discriminator
        32 + // auction
        4 + 256 + // sealed_bid_data (vec with max 256 bytes)
        32 + // commitment_hash
        32 + // bidder_commitment
        8 + // timestamp
        1 + // is_revealed
        1 + // bump
        50 // extra space
    }
}

/// Encrypted loan terms for private borrowing
#[account]
pub struct PrivateLoan {
    /// The circle this loan belongs to
    pub circle: Pubkey,
    /// Borrower's public key
    pub borrower: Pubkey,
    /// Encrypted loan amount
    pub encrypted_amount: Vec<u8>,
    /// Encrypted loan terms (duration, interest, collateral)
    pub encrypted_terms: Vec<u8>,
    /// Arcium session key for this loan
    pub arcium_session_key: Pubkey,
    /// When the loan was created
    pub created_at: i64,
    /// Bump seed for PDA
    pub bump: u8,
}

impl PrivateLoan {
    pub fn space() -> usize {
        8 + // discriminator
        32 + // circle
        32 + // borrower
        4 + 256 + // encrypted_amount
        4 + 512 + // encrypted_terms
        32 + // arcium_session_key
        8 + // created_at
        1 + // bump
        50 // extra space
    }
}

// ============================================================================
// REFLECT YIELD INTEGRATION
// ============================================================================

/// Reflect token type
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ReflectTokenType {
    USDCPlus,  // Yield-bearing USDC+ with price appreciation
    USDJ,      // Delta-neutral strategy token with funding rate capture
}

impl Default for ReflectTokenType {
    fn default() -> Self {
        ReflectTokenType::USDCPlus
    }
}

/// Dual yield tracking for Reflect + Solend
/// Tracks yields from both Reflect price appreciation and Solend lending
#[account]
pub struct ReflectYieldTracking {
    /// The circle this tracking belongs to
    pub circle: Pubkey,
    /// Amount deposited in USDC+
    pub usdc_plus_deposited: u64,
    /// Amount deposited in USDJ
    pub usdj_deposited: u64,
    /// Yield earned from Reflect price appreciation
    pub reflect_yield_earned: u64,
    /// Yield earned from Solend lending
    pub solend_yield_earned: u64,
    /// Last time yield was calculated
    pub last_yield_calculation: i64,
    /// Reflect price at time of deposit (for appreciation tracking)
    pub reflect_price_at_deposit: u64,
    /// Current Reflect price
    pub current_reflect_price: u64,
    /// Token type being used
    pub token_type: ReflectTokenType,
    /// Bump seed for PDA
    pub bump: u8,
}

impl ReflectYieldTracking {
    pub fn space() -> usize {
        8 + // discriminator
        32 + // circle
        8 + // usdc_plus_deposited
        8 + // usdj_deposited
        8 + // reflect_yield_earned
        8 + // solend_yield_earned
        8 + // last_yield_calculation
        8 + // reflect_price_at_deposit
        8 + // current_reflect_price
        1 + // token_type
        1 + // bump
        50 // extra space
    }

    /// Calculate total yield from both sources
    pub fn calculate_total_yield(&self) -> u64 {
        self.reflect_yield_earned.saturating_add(self.solend_yield_earned)
    }

    /// Calculate combined APY (returns basis points)
    pub fn get_combined_apy(&self, time_elapsed_seconds: i64) -> u64 {
        if time_elapsed_seconds <= 0 {
            return 0;
        }

        let total_deposited = self.usdc_plus_deposited.saturating_add(self.usdj_deposited);
        if total_deposited == 0 {
            return 0;
        }

        let total_yield = self.calculate_total_yield();

        // Calculate annualized return
        let seconds_per_year = 31_536_000_u64; // 365 days
        let annualized_yield = (total_yield as u128)
            .saturating_mul(seconds_per_year as u128)
            .checked_div(time_elapsed_seconds as u128)
            .unwrap_or(0) as u64;

        // Return APY in basis points (1% = 100 bps)
        annualized_yield
            .saturating_mul(10_000)
            .checked_div(total_deposited)
            .unwrap_or(0)
    }

    /// Calculate Reflect-specific APY
    pub fn get_reflect_apy(&self, time_elapsed_seconds: i64) -> u64 {
        if time_elapsed_seconds <= 0 || self.reflect_price_at_deposit == 0 {
            return 0;
        }

        // Price appreciation percentage
        let price_increase = self.current_reflect_price.saturating_sub(self.reflect_price_at_deposit);
        let appreciation_bps = price_increase
            .saturating_mul(10_000)
            .checked_div(self.reflect_price_at_deposit)
            .unwrap_or(0);

        // Annualize the return
        let seconds_per_year = 31_536_000_u64;
        appreciation_bps
            .saturating_mul(seconds_per_year)
            .checked_div(time_elapsed_seconds as u64)
            .unwrap_or(0)
    }

    /// Calculate Solend-specific APY
    pub fn get_solend_apy(&self, time_elapsed_seconds: i64) -> u64 {
        if time_elapsed_seconds <= 0 {
            return 0;
        }

        let total_deposited = self.usdc_plus_deposited.saturating_add(self.usdj_deposited);
        if total_deposited == 0 {
            return 0;
        }

        let seconds_per_year = 31_536_000_u64;
        let annualized_yield = (self.solend_yield_earned as u128)
            .saturating_mul(seconds_per_year as u128)
            .checked_div(time_elapsed_seconds as u128)
            .unwrap_or(0) as u64;

        annualized_yield
            .saturating_mul(10_000)
            .checked_div(total_deposited)
            .unwrap_or(0)
    }
}