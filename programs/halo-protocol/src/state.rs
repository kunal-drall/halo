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
    /// Current trust score (cached for quick access)
    pub trust_score: u16,
    /// Trust tier (cached for quick access)
    pub trust_tier: TrustTier,
    /// Number of contributions missed in this circle
    pub contributions_missed: u8,
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
        50 // extra space
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