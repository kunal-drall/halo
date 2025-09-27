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

// Governance and Auction System

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