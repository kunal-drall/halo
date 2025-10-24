use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

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
    
    pub solend_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct DistributeYield<'info> {
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

pub fn deposit_to_solend(
    ctx: Context<DepositToSolend>,
    amount: u64,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let circle = &mut ctx.accounts.circle;
    
    // Validate minimum deposit threshold (e.g., $1000)
    let min_deposit = 100_000_000; // 100 USDC (6 decimals)
    require!(amount >= min_deposit, ErrorCode::BelowMinimumDeposit);
    
    // Transfer tokens to Solend
    let transfer_instruction = Transfer {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        to: ctx.accounts.solend_token_account.to_account_info(),
        authority: ctx.accounts.escrow.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );
    
    token::transfer(cpi_ctx, amount)?;
    
    // Update escrow
    escrow.total_amount -= amount;
    escrow.solend_c_token_balance += amount;
    
    // Update circle
    circle.total_pot -= amount;
    
    Ok(())
}

pub fn withdraw_from_solend(
    ctx: Context<WithdrawFromSolend>,
    amount: u64,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let circle = &mut ctx.accounts.circle;
    
    // Validate sufficient balance
    require!(escrow.solend_c_token_balance >= amount, ErrorCode::InsufficientSolendBalance);
    
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
    escrow.total_amount += amount;
    escrow.solend_c_token_balance -= amount;
    
    // Update circle
    circle.total_pot += amount;
    
    Ok(())
}

pub fn calculate_yield_share(
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
    
    for member in &circle.members {
        // Each member gets equal share of yield
        let member_yield_share = yield_earned / total_members;
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

pub fn distribute_yield(
    ctx: Context<DistributeYield>,
    member: Pubkey,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow;
    let member_authority = &ctx.accounts.member_authority;
    
    // Find member's yield share
    let member_yield_share = escrow.member_yield_shares
        .iter_mut()
        .find(|share| share.member == member)
        .ok_or(ErrorCode::MemberNotFound)?;
    
    // Calculate claimable yield
    let claimable_yield = member_yield_share.yield_earned - member_yield_share.yield_claimed;
    require!(claimable_yield > 0, ErrorCode::NoClaimableYield);
    
    // Validate member is the authority
    require!(member_authority.key() == member, ErrorCode::UnauthorizedMember);
    
    // Transfer yield to member
    let transfer_instruction = Transfer {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        to: ctx.accounts.member_token_account.to_account_info(),
        authority: ctx.accounts.escrow.to_account_info(),
    };
    
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        transfer_instruction,
    );
    
    token::transfer(cpi_ctx, claimable_yield)?;
    
    // Update member's claimed yield
    member_yield_share.yield_claimed += claimable_yield;
    
    // Update escrow
    escrow.total_amount -= claimable_yield;
    
    Ok(())
}

#[error_code]
pub enum ErrorCode {
    #[msg("Deposit amount below minimum threshold")]
    BelowMinimumDeposit,
    #[msg("Insufficient Solend balance")]
    InsufficientSolendBalance,
    #[msg("Member not found")]
    MemberNotFound,
    #[msg("No claimable yield")]
    NoClaimableYield,
    #[msg("Unauthorized member")]
    UnauthorizedMember,
}

