use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::HaloError;
use crate::state::{Circle, CircleEscrow, MemberYieldShare};

#[derive(Accounts)]
pub struct DepositToSolend<'info> {
    #[account(mut)]
    pub circle: Account<'info, Circle>,
    
    #[account(mut)]
    pub escrow: Account<'info, CircleEscrow>,
    
    #[account(
        mut,
        constraint = escrow_token_account.owner == escrow.key()
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = solend_token_account.owner == solend_program.key()
    )]
    pub solend_token_account: Account<'info, TokenAccount>,

    /// CHECK: Solend program address verified by constraint on solend_token_account
    pub solend_program: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawFromSolend<'info> {
    #[account(mut)]
    pub circle: Account<'info, Circle>,
    
    #[account(mut)]
    pub escrow: Account<'info, CircleEscrow>,
    
    #[account(
        mut,
        constraint = escrow_token_account.owner == escrow.key()
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    #[account(
        mut,
        constraint = solend_token_account.owner == solend_program.key()
    )]
    pub solend_token_account: Account<'info, TokenAccount>,

    /// CHECK: Solend program address verified by constraint on solend_token_account
    pub solend_program: AccountInfo<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CalculateYieldShare<'info> {
    #[account(mut)]
    pub circle: Account<'info, Circle>,
    
    #[account(mut)]
    pub escrow: Account<'info, CircleEscrow>,
    
    #[account(
        mut,
        constraint = solend_token_account.owner == solend_program.key()
    )]
    pub solend_token_account: Account<'info, TokenAccount>,

    /// CHECK: Solend program address verified by constraint on solend_token_account
    pub solend_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct DistributeMemberYield<'info> {
    #[account(mut)]
    pub circle: Account<'info, Circle>,

    #[account(mut)]
    pub escrow: Account<'info, CircleEscrow>,

    #[account(
        mut,
        constraint = escrow_token_account.owner == escrow.key()
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = member_token_account.owner == member_authority.key()
    )]
    pub member_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub member_authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub(crate) fn deposit_to_solend(
    ctx: Context<DepositToSolend>,
    amount: u64,
) -> Result<()> {
    // Validate minimum deposit threshold (e.g., $1000)
    let min_deposit = 100_000_000; // 100 USDC (6 decimals)
    require!(amount >= min_deposit, HaloError::BelowMinimumDeposit);

    // Transfer tokens to Solend (do CPI first before mutable borrows)
    // Escrow is a PDA - needs signer seeds
    let circle_key = ctx.accounts.circle.key();
    let escrow_seeds = &[
        b"escrow",
        circle_key.as_ref(),
        &[ctx.accounts.escrow.bump],
    ];
    let escrow_signer = &[&escrow_seeds[..]];

    let transfer_instruction = Transfer {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        to: ctx.accounts.solend_token_account.to_account_info(),
        authority: ctx.accounts.escrow.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
        escrow_signer,
    );

    token::transfer(cpi_ctx, amount)?;

    // Update escrow after CPI
    let escrow = &mut ctx.accounts.escrow;
    escrow.total_amount = escrow.total_amount
        .checked_sub(amount)
        .ok_or(HaloError::ArithmeticOverflow)?;
    escrow.solend_c_token_balance = escrow.solend_c_token_balance
        .checked_add(amount)
        .ok_or(HaloError::ArithmeticOverflow)?;

    // Update circle
    let circle = &mut ctx.accounts.circle;
    circle.total_pot = circle.total_pot
        .checked_sub(amount)
        .ok_or(HaloError::ArithmeticOverflow)?;

    Ok(())
}

pub(crate) fn withdraw_from_solend(
    ctx: Context<WithdrawFromSolend>,
    amount: u64,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let circle = &mut ctx.accounts.circle;
    
    // Validate sufficient balance
    require!(escrow.solend_c_token_balance >= amount, HaloError::InsufficientSolendBalance);
    
    // Transfer tokens from Solend back to escrow
    let transfer_instruction = Transfer {
        from: ctx.accounts.solend_token_account.to_account_info(),
        to: ctx.accounts.escrow_token_account.to_account_info(),
        authority: ctx.accounts.solend_program.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );
    
    token::transfer(cpi_ctx, amount)?;
    
    // Update escrow
    escrow.total_amount = escrow.total_amount
        .checked_add(amount)
        .ok_or(HaloError::ArithmeticOverflow)?;
    escrow.solend_c_token_balance = escrow.solend_c_token_balance
        .checked_sub(amount)
        .ok_or(HaloError::ArithmeticOverflow)?;

    // Update circle
    circle.total_pot = circle.total_pot
        .checked_add(amount)
        .ok_or(HaloError::ArithmeticOverflow)?;
    
    Ok(())
}

pub(crate) fn calculate_yield_share(
    ctx: Context<CalculateYieldShare>,
) -> Result<Vec<(Pubkey, u64)>> {
    let escrow = &mut ctx.accounts.escrow;
    let circle = &ctx.accounts.circle;
    
    // Calculate total yield earned
    let current_c_token_balance = escrow.solend_c_token_balance;
    let total_deposited = circle.total_pot;
    let yield_earned = current_c_token_balance.saturating_sub(total_deposited);
    
    // Update escrow with current yield
    escrow.total_yield_earned = yield_earned;
    escrow.last_yield_calculation = Clock::get()?.unix_timestamp;
    
    // Calculate proportional yield shares for each member
    let mut yield_shares = Vec::new();
    let total_members = circle.members.len() as u64;

    // Guard against division by zero
    if total_members == 0 {
        return Ok(yield_shares);
    }

    for member in &circle.members {
        // Each member gets equal share of yield
        let member_yield_share = yield_earned
            .checked_div(total_members)
            .ok_or(HaloError::ArithmeticOverflow)?;
        yield_shares.push((*member, member_yield_share));
        
        // Update or create member yield share record
        if let Some(existing_share) = escrow.member_yield_shares
            .iter_mut()
            .find(|share| share.member == *member) {
            existing_share.yield_earned = member_yield_share;
        } else {
            escrow.member_yield_shares.push(MemberYieldShare {
                member: *member,
                yield_earned: member_yield_share,
                yield_claimed: 0,
            });
        }
    }
    
    Ok(yield_shares)
}

pub(crate) fn distribute_member_yield(
    ctx: Context<DistributeMemberYield>,
    member: Pubkey,
) -> Result<()> {
    // Validate member is the authority
    require!(ctx.accounts.member_authority.key() == member, HaloError::UnauthorizedMember);

    // First, calculate claimable yield without mutable borrow
    let claimable_yield = {
        let escrow = &ctx.accounts.escrow;
        let member_yield_share = escrow.member_yield_shares
            .iter()
            .find(|share| share.member == member)
            .ok_or(HaloError::MemberNotFound)?;
        let yield_amount = member_yield_share.yield_earned.saturating_sub(member_yield_share.yield_claimed);
        require!(yield_amount > 0, HaloError::NoClaimableYield);
        yield_amount
    };

    // Transfer yield to member (CPI before mutable borrow)
    // Escrow is a PDA - needs signer seeds
    let circle_key = ctx.accounts.circle.key();
    let escrow_seeds = &[
        b"escrow",
        circle_key.as_ref(),
        &[ctx.accounts.escrow.bump],
    ];
    let escrow_signer = &[&escrow_seeds[..]];

    let transfer_instruction = Transfer {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        to: ctx.accounts.member_token_account.to_account_info(),
        authority: ctx.accounts.escrow.to_account_info(),
    };

    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
        escrow_signer,
    );

    token::transfer(cpi_ctx, claimable_yield)?;

    // Now borrow mutably and update
    let escrow = &mut ctx.accounts.escrow;
    if let Some(member_yield_share) = escrow.member_yield_shares
        .iter_mut()
        .find(|share| share.member == member) {
        member_yield_share.yield_claimed = member_yield_share.yield_claimed
            .checked_add(claimable_yield)
            .ok_or(HaloError::ArithmeticOverflow)?;
    }
    escrow.total_amount = escrow.total_amount
        .checked_sub(claimable_yield)
        .ok_or(HaloError::ArithmeticOverflow)?;

    Ok(())
}


