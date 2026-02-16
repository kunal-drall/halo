use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::HaloError;
use crate::state::{Treasury, RevenueParams, RevenueReport};

/// Initialize the global treasury account
pub(crate) fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;
    let clock = Clock::get()?;

    treasury.authority = ctx.accounts.authority.key();
    treasury.total_fees_collected = 0;
    treasury.distribution_fees = 0;
    treasury.yield_fees = 0;
    treasury.management_fees = 0;
    treasury.last_management_fee_collection = clock.unix_timestamp;
    treasury.bump = ctx.bumps.treasury;

    msg!("Treasury initialized with authority: {}", treasury.authority);
    Ok(())
}

/// Initialize revenue parameters with default values
pub(crate) fn initialize_revenue_params(ctx: Context<InitializeRevenueParams>) -> Result<()> {
    let params = &mut ctx.accounts.revenue_params;
    let clock = Clock::get()?;
    
    let (distribution_fee, yield_fee, management_fee, interval) = RevenueParams::default_params();
    
    params.authority = ctx.accounts.authority.key();
    params.distribution_fee_rate = distribution_fee;
    params.yield_fee_rate = yield_fee;
    params.management_fee_rate = management_fee;
    params.management_fee_interval = interval;
    params.last_updated = clock.unix_timestamp;
    params.bump = ctx.bumps.revenue_params;

    msg!("Revenue parameters initialized with defaults");
    Ok(())
}

/// Update revenue parameters (governance only)
pub(crate) fn update_revenue_params(
    ctx: Context<UpdateRevenueParams>,
    distribution_fee_rate: Option<u16>,
    yield_fee_rate: Option<u16>,
    management_fee_rate: Option<u16>,
    management_fee_interval: Option<i64>,
) -> Result<()> {
    let params = &mut ctx.accounts.revenue_params;
    let clock = Clock::get()?;
    
    // Validate fee rates don't exceed 10% (1000 basis points)
    if let Some(rate) = distribution_fee_rate {
        require!(rate <= 1000, HaloError::InvalidFeeRate);
        params.distribution_fee_rate = rate;
    }
    
    if let Some(rate) = yield_fee_rate {
        require!(rate <= 1000, HaloError::InvalidFeeRate);
        params.yield_fee_rate = rate;
    }
    
    if let Some(rate) = management_fee_rate {
        require!(rate <= 1000, HaloError::InvalidFeeRate);
        params.management_fee_rate = rate;
    }
    
    if let Some(interval) = management_fee_interval {
        require!(interval >= 86400, HaloError::InvalidFeeRate); // At least 1 day
        params.management_fee_interval = interval;
    }
    
    params.last_updated = clock.unix_timestamp;
    
    msg!("Revenue parameters updated by governance");
    Ok(())
}

/// Collect management fees from all active stakes
pub(crate) fn collect_management_fees(ctx: Context<CollectManagementFees>) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;
    let params = &ctx.accounts.revenue_params;
    let clock = Clock::get()?;
    
    // Check if enough time has passed since last collection
    let time_since_last = clock.unix_timestamp - treasury.last_management_fee_collection;
    require!(
        time_since_last >= params.management_fee_interval,
        HaloError::RevenueCollectionTooFrequent
    );
    
    // Calculate management fee based on total stake in escrow
    let escrow_balance = ctx.accounts.escrow_token_account.amount;
    let management_fee = params.calculate_management_fee(escrow_balance, time_since_last)?;
    
    if management_fee > 0 {
        // Transfer management fee to treasury
        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        
        // Create signer seeds for escrow PDA
        let circle_key = ctx.accounts.circle.key();
        let seeds = &[
            b"escrow".as_ref(),
            circle_key.as_ref(),
            &[ctx.accounts.escrow.bump],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, management_fee)?;
        
        // Update treasury tracking
        treasury.management_fees = treasury.management_fees
            .checked_add(management_fee)
            .ok_or(HaloError::ArithmeticOverflow)?;
        treasury.total_fees_collected = treasury.total_fees_collected
            .checked_add(management_fee)
            .ok_or(HaloError::ArithmeticOverflow)?;
    }
    
    treasury.last_management_fee_collection = clock.unix_timestamp;
    
    msg!("Management fees collected: {} tokens", management_fee);
    Ok(())
}

/// Distribute yield with fee collection (for Solend integration)
pub(crate) fn distribute_yield(ctx: Context<DistributeYield>, yield_amount: u64) -> Result<()> {
    let treasury = &mut ctx.accounts.treasury;
    let params = &ctx.accounts.revenue_params;
    
    require!(yield_amount > 0, HaloError::InvalidContributionAmount);
    
    // Calculate yield fee (0.25% by default)
    let yield_fee = params.calculate_yield_fee(yield_amount)?;
    let net_yield_amount = yield_amount.checked_sub(yield_fee)
        .ok_or(HaloError::ArithmeticOverflow)?;

    // Collect yield fee first (if any)
    if yield_fee > 0 {
        collect_yield_fee(
            yield_amount,
            params,
            treasury,
            &ctx.accounts.source_token_account.to_account_info(),
            &ctx.accounts.treasury_token_account.to_account_info(),
            &ctx.accounts.authority.to_account_info(),
            &ctx.accounts.token_program.to_account_info(),
            None, // No seeds needed for user authority
        )?;
    }

    // Transfer remaining yield to recipient
    let cpi_accounts = Transfer {
        from: ctx.accounts.source_token_account.to_account_info(),
        to: ctx.accounts.recipient_token_account.to_account_info(),
        authority: ctx.accounts.authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, net_yield_amount)?;

    msg!("Yield of {} distributed (fee: {}, net: {})", 
         yield_amount, yield_fee, net_yield_amount);
    Ok(())
}
pub(crate) fn create_revenue_report(
    ctx: Context<CreateRevenueReport>,
    period_start: i64,
    period_end: i64,
) -> Result<()> {
    require!(period_start < period_end, HaloError::InvalidRevenueReportPeriod);
    
    let report = &mut ctx.accounts.revenue_report;
    let treasury = &ctx.accounts.treasury;
    
    report.period_start = period_start;
    report.period_end = period_end;
    
    // For now, we'll use the current treasury totals as period totals
    // In a production system, you'd want to track period-specific data
    report.total_period_fees = treasury.total_fees_collected;
    report.period_distribution_fees = treasury.distribution_fees;
    report.period_yield_fees = treasury.yield_fees;
    report.period_management_fees = treasury.management_fees;
    
    // These would be calculated from actual data in production
    report.active_circles = 0;
    report.total_distributions = 0;
    report.total_yield = 0;
    report.total_managed_stake = 0;
    
    report.bump = ctx.bumps.revenue_report;
    
    msg!("Revenue report created for period {} to {}", period_start, period_end);
    Ok(())
}

/// Internal helper function to collect distribution fees
pub(crate) fn collect_distribution_fee<'info>(
    distribution_amount: u64,
    params: &RevenueParams,
    treasury: &mut Treasury,
    from_account: &AccountInfo<'info>,
    to_account: &AccountInfo<'info>,
    authority: &AccountInfo<'info>,
    token_program: &AccountInfo<'info>,
    authority_seeds: Option<&[&[&[u8]]]>,
) -> Result<u64> {
    let fee_amount = params.calculate_distribution_fee(distribution_amount)?;
    
    if fee_amount > 0 {
        let cpi_accounts = Transfer {
            from: from_account.clone(),
            to: to_account.clone(),
            authority: authority.clone(),
        };
        
        let cpi_ctx = if let Some(seeds) = authority_seeds {
            CpiContext::new_with_signer(token_program.clone(), cpi_accounts, seeds)
        } else {
            CpiContext::new(token_program.clone(), cpi_accounts)
        };
        
        token::transfer(cpi_ctx, fee_amount)?;
        
        // Update treasury tracking
        treasury.distribution_fees = treasury.distribution_fees
            .checked_add(fee_amount)
            .ok_or(HaloError::ArithmeticOverflow)?;
        treasury.total_fees_collected = treasury.total_fees_collected
            .checked_add(fee_amount)
            .ok_or(HaloError::ArithmeticOverflow)?;
    }
    
    Ok(fee_amount)
}

/// Internal helper function to collect yield fees
pub(crate) fn collect_yield_fee<'info>(
    yield_amount: u64,
    params: &RevenueParams,
    treasury: &mut Treasury,
    from_account: &AccountInfo<'info>,
    to_account: &AccountInfo<'info>,
    authority: &AccountInfo<'info>,
    token_program: &AccountInfo<'info>,
    authority_seeds: Option<&[&[&[u8]]]>,
) -> Result<u64> {
    let fee_amount = params.calculate_yield_fee(yield_amount)?;
    
    if fee_amount > 0 {
        let cpi_accounts = Transfer {
            from: from_account.clone(),
            to: to_account.clone(),
            authority: authority.clone(),
        };
        
        let cpi_ctx = if let Some(seeds) = authority_seeds {
            CpiContext::new_with_signer(token_program.clone(), cpi_accounts, seeds)
        } else {
            CpiContext::new(token_program.clone(), cpi_accounts)
        };
        
        token::transfer(cpi_ctx, fee_amount)?;
        
        // Update treasury tracking
        treasury.yield_fees = treasury.yield_fees
            .checked_add(fee_amount)
            .ok_or(HaloError::ArithmeticOverflow)?;
        treasury.total_fees_collected = treasury.total_fees_collected
            .checked_add(fee_amount)
            .ok_or(HaloError::ArithmeticOverflow)?;
    }
    
    Ok(fee_amount)
}

// Account structs for the revenue instructions

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(
        init,
        payer = authority,
        space = Treasury::SPACE,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeRevenueParams<'info> {
    #[account(
        init,
        payer = authority,
        space = RevenueParams::SPACE,
        seeds = [b"revenue_params"],
        bump
    )]
    pub revenue_params: Account<'info, RevenueParams>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateRevenueParams<'info> {
    #[account(
        mut,
        seeds = [b"revenue_params"],
        bump = revenue_params.bump,
        constraint = revenue_params.authority == authority.key() @ HaloError::UnauthorizedRevenueOperation
    )]
    pub revenue_params: Account<'info, RevenueParams>,
    
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct CollectManagementFees<'info> {
    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(
        seeds = [b"revenue_params"],
        bump = revenue_params.bump
    )]
    pub revenue_params: Account<'info, RevenueParams>,
    
    /// Circle account to get escrow reference
    pub circle: Account<'info, crate::state::Circle>,
    
    /// Escrow account that holds member stakes
    #[account(
        seeds = [b"escrow", circle.key().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, crate::state::CircleEscrow>,
    
    /// Token account holding the escrowed funds
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    /// Treasury token account to receive fees
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    
    /// Authority that can collect management fees (should be automated/governance)
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(period_start: i64, period_end: i64)]
pub struct CreateRevenueReport<'info> {
    #[account(
        init,
        payer = authority,
        space = RevenueReport::SPACE,
        seeds = [b"revenue_report", period_start.to_le_bytes().as_ref(), period_end.to_le_bytes().as_ref()],
        bump
    )]
    pub revenue_report: Account<'info, RevenueReport>,
    
    #[account(
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
#[instruction(yield_amount: u64)]
pub struct DistributeYield<'info> {
    #[account(
        mut,
        seeds = [b"treasury"],
        bump = treasury.bump
    )]
    pub treasury: Account<'info, Treasury>,
    
    #[account(
        seeds = [b"revenue_params"],
        bump = revenue_params.bump
    )]
    pub revenue_params: Account<'info, RevenueParams>,
    
    /// Authority that controls the source tokens (e.g., Solend integration service)
    pub authority: Signer<'info>,
    
    /// Source token account containing yield to distribute
    #[account(mut)]
    pub source_token_account: Account<'info, TokenAccount>,
    
    /// Recipient token account to receive net yield
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    /// Treasury token account to receive fees
    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}
