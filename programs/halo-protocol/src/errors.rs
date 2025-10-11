use anchor_lang::prelude::*;

#[error_code]
pub enum HaloError {
    #[msg("Circle is full")]
    CircleFull,
    #[msg("Invalid contribution amount")]
    InvalidContributionAmount,
    #[msg("Member already exists in circle")]
    MemberAlreadyExists,
    #[msg("Member not found in circle")]
    MemberNotFound,
    #[msg("Circle is not active")]
    CircleNotActive,
    #[msg("Insufficient stake amount")]
    InsufficientStake,
    #[msg("Contribution already made for this month")]
    ContributionAlreadyMade,
    #[msg("Cannot contribute for future months")]
    InvalidContributionMonth,
    #[msg("Pot already distributed for this month")]
    PotAlreadyDistributed,
    #[msg("No contributions to distribute")]
    NoContributionsToDistribute,
    #[msg("Not authorized to distribute pot")]
    NotAuthorizedToDistribute,
    #[msg("Member has already received pot")]
    MemberAlreadyReceivedPot,
    #[msg("Invalid penalty rate")]
    InvalidPenaltyRate,
    #[msg("Member is in default")]
    MemberInDefault,
    #[msg("Cannot leave circle during active period")]
    CannotLeaveActivePeriod,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Invalid duration")]
    InvalidDuration,
    #[msg("Invalid max members")]
    InvalidMaxMembers,
    #[msg("Circle has already ended")]
    CircleEnded,
    #[msg("Trust score account not found")]
    TrustScoreNotFound,
    #[msg("Invalid trust tier")]
    InvalidTrustTier,
    #[msg("Insufficient trust score")]
    InsufficientTrustScore,
    #[msg("Social proof already exists")]
    SocialProofAlreadyExists,
    #[msg("Invalid social proof")]
    InvalidSocialProof,
    #[msg("Proposal not found")]
    ProposalNotFound,
    #[msg("Proposal not active")]
    ProposalNotActive,
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    #[msg("Voting period has not started")]
    VotingPeriodNotStarted,
    #[msg("Already voted on this proposal")]
    AlreadyVoted,
    #[msg("Insufficient voting power")]
    InsufficientVotingPower,
    #[msg("Proposal execution threshold not met")]
    ExecutionThresholdNotMet,
    #[msg("Proposal already executed")]
    ProposalAlreadyExecuted,
    #[msg("Invalid proposal type")]
    InvalidProposalType,
    #[msg("Invalid voting period")]
    InvalidVotingPeriod,
    #[msg("Auction not found")]
    AuctionNotFound,
    #[msg("Auction not active")]
    AuctionNotActive,
    #[msg("Auction has ended")]
    AuctionHasEnded,
    #[msg("Bid too low")]
    BidTooLow,
    #[msg("Insufficient stake for bid")]
    InsufficientStakeForBid,
    #[msg("Cannot bid on own auction")]
    CannotBidOnOwnAuction,
    #[msg("Auction already settled")]
    AuctionAlreadySettled,
    #[msg("Only auction winner can claim")]
    OnlyWinnerCanClaim,
    #[msg("Auction not ended")]
    AuctionNotEnded,
    #[msg("Invalid auction duration")]
    InvalidAuctionDuration,
    #[msg("No pot available for auction")]
    NoPotAvailableForAuction,
    #[msg("Automation is disabled")]
    AutomationDisabled,
    #[msg("Automation not scheduled at this time")]
    AutomationNotScheduled,
    #[msg("Automation check too frequent")]
    AutomationTooFrequent,
    #[msg("Automation job not found")]
    AutomationJobNotFound,
    #[msg("Invalid automation configuration")]
    InvalidAutomationConfig,
    #[msg("Invalid fee rate")]
    InvalidFeeRate,
    #[msg("Treasury not initialized")]
    TreasuryNotInitialized,
    #[msg("Unauthorized revenue operation")]
    UnauthorizedRevenueOperation,
    #[msg("Revenue collection too frequent")]
    RevenueCollectionTooFrequent,
    #[msg("Invalid revenue report period")]
    InvalidRevenueReportPeriod,
}