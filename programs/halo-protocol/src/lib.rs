use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

declare_id!("7KZ32HfH5Bj2YJVg4VRhYpTnMFHKx1iew4Rhy8nhQNiZ");

pub mod errors;
pub mod instructions;
pub mod state;
pub mod revenue;

pub use errors::*;
pub use instructions::*;
pub use state::*;
pub use revenue::*;

#[program]
pub mod halo_protocol {
    use super::*;

    pub fn initialize_circle(
        ctx: Context<InitializeCircle>,
        contribution_amount: u64,
        duration_months: u8,
        max_members: u8,
        penalty_rate: u16, // basis points (1% = 100)
    ) -> Result<()> {
        instructions::initialize_circle(ctx, contribution_amount, duration_months, max_members, penalty_rate)
    }

    pub fn join_circle(ctx: Context<JoinCircle>, stake_amount: u64) -> Result<()> {
        instructions::join_circle(ctx, stake_amount)
    }

    pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
        instructions::contribute(ctx, amount)
    }

    pub fn distribute_pot(ctx: Context<DistributePot>) -> Result<()> {
        instructions::distribute_pot(ctx)
    }

    pub fn claim_penalty(ctx: Context<ClaimPenalty>) -> Result<()> {
        instructions::claim_penalty(ctx)
    }

    pub fn leave_circle(ctx: Context<LeaveCircle>) -> Result<()> {
        instructions::leave_circle(ctx)
    }

    pub fn initialize_trust_score(ctx: Context<InitializeTrustScore>) -> Result<()> {
        instructions::initialize_trust_score(ctx)
    }

    pub fn update_trust_score(ctx: Context<UpdateTrustScore>) -> Result<()> {
        instructions::update_trust_score(ctx)
    }

    pub fn add_social_proof(
        ctx: Context<AddSocialProof>,
        proof_type: String,
        identifier: String,
    ) -> Result<()> {
        instructions::add_social_proof(ctx, proof_type, identifier)
    }

    pub fn verify_social_proof(
        ctx: Context<VerifySocialProof>,
        proof_type: String,
        identifier: String,
    ) -> Result<()> {
        instructions::verify_social_proof(ctx, proof_type, identifier)
    }

    pub fn update_defi_activity_score(
        ctx: Context<UpdateDefiActivityScore>,
        activity_score: u16,
    ) -> Result<()> {
        instructions::update_defi_activity_score(ctx, activity_score)
    }

    pub fn complete_circle_update_trust(ctx: Context<CompleteCircleUpdateTrust>) -> Result<()> {
        instructions::complete_circle_update_trust(ctx)
    }

    // Governance Instructions
    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        title: String,
        description: String,
        proposal_type: u8,
        voting_duration_hours: u16,
        execution_threshold: u64,
        new_interest_rate: Option<u16>,
    ) -> Result<()> {
        instructions::create_proposal(ctx, title, description, proposal_type, voting_duration_hours, execution_threshold, new_interest_rate)
    }

    pub fn cast_vote(
        ctx: Context<CastVote>,
        support: bool,
        voting_power: u64,
    ) -> Result<()> {
        instructions::cast_vote(ctx, support, voting_power)
    }

    pub fn execute_proposal(ctx: Context<ExecuteProposal>) -> Result<()> {
        instructions::execute_proposal(ctx)
    }

    // Auction Instructions
    pub fn create_auction(
        ctx: Context<CreateAuction>,
        pot_amount: u64,
        starting_bid: u64,
        duration_hours: u16,
    ) -> Result<()> {
        instructions::create_auction(ctx, pot_amount, starting_bid, duration_hours)
    }

    pub fn place_bid(
        ctx: Context<PlaceBid>,
        bid_amount: u64,
    ) -> Result<()> {
        instructions::place_bid(ctx, bid_amount)
    }

    pub fn settle_auction(ctx: Context<SettleAuction>) -> Result<()> {
        instructions::settle_auction(ctx)
    }

    // Automation instructions
    pub fn initialize_automation_state(
        ctx: Context<InitializeAutomationState>,
        min_interval: i64,
    ) -> Result<()> {
        instructions::initialize_automation_state(ctx, min_interval)
    }

    pub fn setup_circle_automation(
        ctx: Context<SetupCircleAutomation>,
        auto_collect: bool,
        auto_distribute: bool,
        auto_penalty: bool,
    ) -> Result<()> {
        instructions::setup_circle_automation(ctx, auto_collect, auto_distribute, auto_penalty)
    }

    pub fn automated_contribution_collection(
        ctx: Context<AutomatedContributionCollection>,
    ) -> Result<()> {
        instructions::automated_contribution_collection(ctx)
    }

    pub fn automated_payout_distribution(
        ctx: Context<AutomatedPayoutDistribution>,
        recipient: Pubkey,
    ) -> Result<()> {
        instructions::automated_payout_distribution(ctx, recipient)
    }

    pub fn automated_penalty_enforcement(
        ctx: Context<AutomatedPenaltyEnforcement>,
    ) -> Result<()> {
        instructions::automated_penalty_enforcement(ctx)
    }

    pub fn update_automation_settings(
        ctx: Context<UpdateAutomationSettings>,
        enabled: bool,
        min_interval: Option<i64>,
    ) -> Result<()> {
        instructions::update_automation_settings(ctx, enabled, min_interval)
    }

    pub fn switchboard_automation_callback(
        ctx: Context<SwitchboardAutomationCallback>,
    ) -> Result<()> {
        instructions::switchboard_automation_callback(ctx)
    }

    // Revenue module instructions
    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        revenue::initialize_treasury(ctx)
    }

    pub fn initialize_revenue_params(ctx: Context<InitializeRevenueParams>) -> Result<()> {
        revenue::initialize_revenue_params(ctx)
    }

    pub fn update_revenue_params(
        ctx: Context<UpdateRevenueParams>,
        distribution_fee_rate: Option<u16>,
        yield_fee_rate: Option<u16>,
        management_fee_rate: Option<u16>,
        management_fee_interval: Option<i64>,
    ) -> Result<()> {
        revenue::update_revenue_params(ctx, distribution_fee_rate, yield_fee_rate, management_fee_rate, management_fee_interval)
    }

    pub fn collect_management_fees(ctx: Context<CollectManagementFees>) -> Result<()> {
        revenue::collect_management_fees(ctx)
    }

    pub fn create_revenue_report(
        ctx: Context<CreateRevenueReport>,
        period_start: i64,
        period_end: i64,
    ) -> Result<()> {
        revenue::create_revenue_report(ctx, period_start, period_end)
    }

    pub fn distribute_yield(ctx: Context<DistributeYield>, yield_amount: u64) -> Result<()> {
        revenue::distribute_yield(ctx, yield_amount)
    }
}