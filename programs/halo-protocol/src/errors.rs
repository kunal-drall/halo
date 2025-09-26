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
}