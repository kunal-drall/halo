use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::HaloError;
use crate::state::{Circle, Member, MemberStatus};

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

pub(crate) fn stake_insurance(
    ctx: Context<StakeInsurance>,
    amount: u64,
) -> Result<()> {
    let insurance_pool = &mut ctx.accounts.insurance_pool;
    let member = &mut ctx.accounts.member;
    let circle = &mut ctx.accounts.circle;
    
    // Validate insurance amount (10-20% of contribution)
    let min_insurance = circle.contribution_amount
        .checked_mul(10)
        .and_then(|v| v.checked_div(100))
        .ok_or(HaloError::ArithmeticOverflow)?;
    let max_insurance = circle.contribution_amount
        .checked_mul(20)
        .and_then(|v| v.checked_div(100))
        .ok_or(HaloError::ArithmeticOverflow)?;
    
    require!(amount >= min_insurance, HaloError::InsufficientInsurance);
    require!(amount <= max_insurance, HaloError::ExcessiveInsurance);
    
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
    insurance_pool.total_staked = insurance_pool.total_staked
        .checked_add(amount)
        .ok_or(HaloError::ArithmeticOverflow)?;
    insurance_pool.available_coverage = insurance_pool.available_coverage
        .checked_add(amount)
        .ok_or(HaloError::ArithmeticOverflow)?;
    
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

pub(crate) fn claim_insurance(
    ctx: Context<ClaimInsurance>,
    defaulting_member: Pubkey,
) -> Result<()> {
    // Calculate claimable amount first without mutable borrow
    let (claimable_amount, member_authority) = {
        let insurance_pool = &ctx.accounts.insurance_pool;
        let member = &ctx.accounts.member;

        // Find the defaulting member's stake
        let defaulting_stake = insurance_pool.member_stakes
            .iter()
            .find(|stake| stake.member == defaulting_member)
            .ok_or(HaloError::MemberNotFound)?;

        // Calculate claimable amount (proportional to member's stake)
        let total_stake = insurance_pool.total_staked;
        let member_stake_amount = member.insurance_staked;
        let amount = defaulting_stake.amount_staked
            .checked_mul(member_stake_amount)
            .and_then(|v| v.checked_div(total_stake))
            .ok_or(HaloError::ArithmeticOverflow)?;

        require!(amount > 0, HaloError::NoClaimableInsurance);
        require!(insurance_pool.available_coverage >= amount, HaloError::InsufficientCoverage);

        (amount, member.authority)
    };

    // Transfer insurance to member (CPI before mutable borrow)
    // Insurance pool is a PDA - needs signer seeds
    let circle_key = ctx.accounts.circle.key();
    let insurance_seeds = &[
        b"insurance",
        circle_key.as_ref(),
        &[ctx.accounts.insurance_pool.bump],
    ];
    let insurance_signer = &[&insurance_seeds[..]];

    let transfer_instruction = Transfer {
        from: ctx.accounts.insurance_token_account.to_account_info(),
        to: ctx.accounts.member_token_account.to_account_info(),
        authority: ctx.accounts.insurance_pool.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
        insurance_signer,
    );

    token::transfer(cpi_ctx, claimable_amount)?;

    // Now borrow mutably and update
    let insurance_pool = &mut ctx.accounts.insurance_pool;
    insurance_pool.available_coverage = insurance_pool.available_coverage
        .checked_sub(claimable_amount)
        .ok_or(HaloError::ArithmeticOverflow)?;
    insurance_pool.claims_paid = insurance_pool.claims_paid
        .checked_add(claimable_amount)
        .ok_or(HaloError::ArithmeticOverflow)?;

    // Mark member as having claimed
    if let Some(stake) = insurance_pool.member_stakes
        .iter_mut()
        .find(|stake| stake.member == member_authority) {
        stake.can_claim = false;
    }

    Ok(())
}

pub(crate) fn return_insurance_with_bonus(
    ctx: Context<ReturnInsuranceWithBonus>,
) -> Result<()> {
    // Calculate amounts first without mutable borrow
    let (total_return, original_stake, member_authority) = {
        let insurance_pool = &ctx.accounts.insurance_pool;
        let member = &ctx.accounts.member;

        // Find member's stake
        let member_stake = insurance_pool.member_stakes
            .iter()
            .find(|stake| stake.member == member.authority)
            .ok_or(HaloError::MemberNotFound)?;

        // Calculate bonus (5% of original stake)
        let bonus = member_stake.amount_staked
            .checked_mul(5)
            .and_then(|v| v.checked_div(100))
            .ok_or(HaloError::ArithmeticOverflow)?;
        let return_amount = member_stake.amount_staked
            .checked_add(bonus)
            .ok_or(HaloError::ArithmeticOverflow)?;

        require!(insurance_pool.available_coverage >= return_amount, HaloError::InsufficientCoverage);

        (return_amount, member_stake.amount_staked, member.authority)
    };

    // Transfer insurance + bonus to member (CPI before mutable borrow)
    // Insurance pool is a PDA - needs signer seeds
    let circle_key = ctx.accounts.circle.key();
    let insurance_seeds = &[
        b"insurance",
        circle_key.as_ref(),
        &[ctx.accounts.insurance_pool.bump],
    ];
    let insurance_signer = &[&insurance_seeds[..]];

    let transfer_instruction = Transfer {
        from: ctx.accounts.insurance_token_account.to_account_info(),
        to: ctx.accounts.member_token_account.to_account_info(),
        authority: ctx.accounts.insurance_pool.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
        insurance_signer,
    );

    token::transfer(cpi_ctx, total_return)?;

    // Now borrow mutably and update
    let insurance_pool = &mut ctx.accounts.insurance_pool;
    insurance_pool.available_coverage = insurance_pool.available_coverage
        .checked_sub(total_return)
        .ok_or(HaloError::ArithmeticOverflow)?;
    insurance_pool.total_staked = insurance_pool.total_staked
        .checked_sub(original_stake)
        .ok_or(HaloError::ArithmeticOverflow)?;

    // Remove member from stakes
    insurance_pool.member_stakes.retain(|stake| stake.member != member_authority);

    // Reset member insurance
    let member = &mut ctx.accounts.member;
    member.insurance_staked = 0;

    Ok(())
}

pub(crate) fn slash_insurance(
    ctx: Context<SlashInsurance>,
) -> Result<()> {
    let insurance_pool = &mut ctx.accounts.insurance_pool;
    let member = &mut ctx.accounts.member;
    
    // Find member's stake
    let member_stake = insurance_pool.member_stakes
        .iter()
        .find(|stake| stake.member == member.authority)
        .ok_or(HaloError::MemberNotFound)?;
    
    // Slash the entire insurance stake
    let slashed_amount = member_stake.amount_staked;
    
    // Update insurance pool
    insurance_pool.total_staked = insurance_pool.total_staked
        .checked_sub(slashed_amount)
        .ok_or(HaloError::ArithmeticOverflow)?;
    insurance_pool.available_coverage = insurance_pool.available_coverage
        .checked_sub(slashed_amount)
        .ok_or(HaloError::ArithmeticOverflow)?;
    
    // Remove member from stakes
    insurance_pool.member_stakes.retain(|stake| stake.member != member.authority);
    
    // Reset member insurance
    member.insurance_staked = 0;
    
    // Mark member as defaulted
    member.status = MemberStatus::Defaulted;
    
    Ok(())
}


