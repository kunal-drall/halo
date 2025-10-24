use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

#[account]
pub struct InsurancePool {
    /// The circle this insurance pool belongs to
    pub circle: Pubkey,
    /// Total amount staked by all members
    pub total_staked: u64,
    /// Available coverage for claims
    pub available_coverage: u64,
    /// Total claims paid out
    pub claims_paid: u64,
    /// Member stakes in this pool
    pub member_stakes: Vec<MemberStake>,
    /// Bump seed for PDA
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct MemberStake {
    pub member: Pubkey,
    pub amount_staked: u64,
    pub can_claim: bool,
}

impl InsurancePool {
    pub fn space() -> usize {
        8 + // discriminator
        32 + // circle
        8 + // total_staked
        8 + // available_coverage
        8 + // claims_paid
        4 + (32 + 8 + 1) * 20 + // member_stakes (max 20 members)
        1 + // bump
        100 // extra space
    }
}

#[derive(Accounts)]
pub struct StakeInsurance<'info> {
    #[account(
        init,
        payer = member,
        space = InsurancePool::space(),
        seeds = [b"insurance", circle.key().as_ref()],
        bump
    )]
    pub insurance_pool: Account<'info, InsurancePool>,
    
    #[account(mut)]
    pub circle: Account<'info, Circle>,
    
    #[account(
        mut,
        constraint = member_authority.key() == member.authority
    )]
    pub member: Account<'info, Member>,
    
    #[account(mut)]
    pub member_authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = member_token_account.owner == member_authority.key()
    )]
    pub member_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = insurance_token_account.owner == insurance_pool.key()
    )]
    pub insurance_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimInsurance<'info> {
    #[account(
        mut,
        constraint = insurance_pool.circle == circle.key()
    )]
    pub insurance_pool: Account<'info, InsurancePool>,
    
    #[account(mut)]
    pub circle: Account<'info, Circle>,
    
    #[account(
        mut,
        constraint = member_authority.key() == member.authority
    )]
    pub member: Account<'info, Member>,
    
    #[account(mut)]
    pub member_authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = member_token_account.owner == member_authority.key()
    )]
    pub member_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = insurance_token_account.owner == insurance_pool.key()
    )]
    pub insurance_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ReturnInsuranceWithBonus<'info> {
    #[account(
        mut,
        constraint = insurance_pool.circle == circle.key()
    )]
    pub insurance_pool: Account<'info, InsurancePool>,
    
    #[account(mut)]
    pub circle: Account<'info, Circle>,
    
    #[account(
        mut,
        constraint = member_authority.key() == member.authority
    )]
    pub member: Account<'info, Member>,
    
    #[account(mut)]
    pub member_authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = member_token_account.owner == member_authority.key()
    )]
    pub member_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = insurance_token_account.owner == insurance_pool.key()
    )]
    pub insurance_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct SlashInsurance<'info> {
    #[account(
        mut,
        constraint = insurance_pool.circle == circle.key()
    )]
    pub insurance_pool: Account<'info, InsurancePool>,
    
    #[account(mut)]
    pub circle: Account<'info, Circle>,
    
    #[account(
        mut,
        constraint = member_authority.key() == member.authority
    )]
    pub member: Account<'info, Member>,
    
    #[account(mut)]
    pub member_authority: Signer<'info>,
    
    #[account(
        mut,
        constraint = insurance_token_account.owner == insurance_pool.key()
    )]
    pub insurance_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

pub fn stake_insurance(
    ctx: Context<StakeInsurance>,
    amount: u64,
) -> Result<()> {
    let insurance_pool = &mut ctx.accounts.insurance_pool;
    let member = &mut ctx.accounts.member;
    let circle = &mut ctx.accounts.circle;
    
    // Validate insurance amount (10-20% of contribution)
    let min_insurance = circle.contribution_amount * 10 / 100;
    let max_insurance = circle.contribution_amount * 20 / 100;
    
    require!(amount >= min_insurance, ErrorCode::InsufficientInsurance);
    require!(amount <= max_insurance, ErrorCode::ExcessiveInsurance);
    
    // Transfer tokens to insurance pool
    let transfer_instruction = Transfer {
        from: ctx.accounts.member_token_account.to_account_info(),
        to: ctx.accounts.insurance_token_account.to_account_info(),
        authority: ctx.accounts.member_authority.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );
    
    token::transfer(cpi_ctx, amount)?;
    
    // Update insurance pool
    insurance_pool.circle = circle.key();
    insurance_pool.total_staked += amount;
    insurance_pool.available_coverage += amount;
    
    // Add member stake
    insurance_pool.member_stakes.push(MemberStake {
        member: member.authority,
        amount_staked: amount,
        can_claim: false,
    });
    
    // Update member
    member.insurance_staked = amount;
    
    Ok(())
}

pub fn claim_insurance(
    ctx: Context<ClaimInsurance>,
    defaulting_member: Pubkey,
) -> Result<()> {
    let insurance_pool = &mut ctx.accounts.insurance_pool;
    let member = &mut ctx.accounts.member;
    
    // Find the defaulting member's stake
    let defaulting_stake = insurance_pool.member_stakes
        .iter()
        .find(|stake| stake.member == defaulting_member)
        .ok_or(ErrorCode::MemberNotFound)?;
    
    // Calculate claimable amount (proportional to member's stake)
    let total_stake = insurance_pool.total_staked;
    let member_stake = member.insurance_staked;
    let claimable_amount = (defaulting_stake.amount_staked * member_stake) / total_stake;
    
    require!(claimable_amount > 0, ErrorCode::NoClaimableInsurance);
    require!(insurance_pool.available_coverage >= claimable_amount, ErrorCode::InsufficientCoverage);
    
    // Transfer insurance to member
    let transfer_instruction = Transfer {
        from: ctx.accounts.insurance_token_account.to_account_info(),
        to: ctx.accounts.member_token_account.to_account_info(),
        authority: ctx.accounts.insurance_pool.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );
    
    token::transfer(cpi_ctx, claimable_amount)?;
    
    // Update insurance pool
    insurance_pool.available_coverage -= claimable_amount;
    insurance_pool.claims_paid += claimable_amount;
    
    // Mark member as having claimed
    if let Some(member_stake) = insurance_pool.member_stakes
        .iter_mut()
        .find(|stake| stake.member == member.authority) {
        member_stake.can_claim = false;
    }
    
    Ok(())
}

pub fn return_insurance_with_bonus(
    ctx: Context<ReturnInsuranceWithBonus>,
) -> Result<()> {
    let insurance_pool = &mut ctx.accounts.insurance_pool;
    let member = &mut ctx.accounts.member;
    
    // Find member's stake
    let member_stake = insurance_pool.member_stakes
        .iter()
        .find(|stake| stake.member == member.authority)
        .ok_or(ErrorCode::MemberNotFound)?;
    
    // Calculate bonus (5% of original stake)
    let bonus = member_stake.amount_staked * 5 / 100;
    let total_return = member_stake.amount_staked + bonus;
    
    require!(insurance_pool.available_coverage >= total_return, ErrorCode::InsufficientCoverage);
    
    // Transfer insurance + bonus to member
    let transfer_instruction = Transfer {
        from: ctx.accounts.insurance_token_account.to_account_info(),
        to: ctx.accounts.member_token_account.to_account_info(),
        authority: ctx.accounts.insurance_pool.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );
    
    token::transfer(cpi_ctx, total_return)?;
    
    // Update insurance pool
    insurance_pool.available_coverage -= total_return;
    insurance_pool.total_staked -= member_stake.amount_staked;
    
    // Remove member from stakes
    insurance_pool.member_stakes.retain(|stake| stake.member != member.authority);
    
    // Reset member insurance
    member.insurance_staked = 0;
    
    Ok(())
}

pub fn slash_insurance(
    ctx: Context<SlashInsurance>,
) -> Result<()> {
    let insurance_pool = &mut ctx.accounts.insurance_pool;
    let member = &mut ctx.accounts.member;
    
    // Find member's stake
    let member_stake = insurance_pool.member_stakes
        .iter()
        .find(|stake| stake.member == member.authority)
        .ok_or(ErrorCode::MemberNotFound)?;
    
    // Slash the entire insurance stake
    let slashed_amount = member_stake.amount_staked;
    
    // Update insurance pool
    insurance_pool.total_staked -= slashed_amount;
    insurance_pool.available_coverage -= slashed_amount;
    
    // Remove member from stakes
    insurance_pool.member_stakes.retain(|stake| stake.member != member.authority);
    
    // Reset member insurance
    member.insurance_staked = 0;
    
    // Mark member as defaulted
    member.status = MemberStatus::Defaulted;
    
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Insufficient insurance amount")]
    InsufficientInsurance,
    #[msg("Excessive insurance amount")]
    ExcessiveInsurance,
    #[msg("Member not found")]
    MemberNotFound,
    #[msg("No claimable insurance")]
    NoClaimableInsurance,
    #[msg("Insufficient coverage")]
    InsufficientCoverage,
}

