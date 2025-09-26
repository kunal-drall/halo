use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

use crate::errors::HaloError;
use crate::state::{Circle, Member, CircleEscrow, CircleStatus, MemberStatus, MonthlyContribution, MemberContribution};

pub fn initialize_circle(
    ctx: Context<InitializeCircle>,
    contribution_amount: u64,
    duration_months: u8,
    max_members: u8,
    penalty_rate: u16,
) -> Result<()> {
    require!(duration_months > 0 && duration_months <= Circle::MAX_DURATION, HaloError::InvalidDuration);
    require!(max_members > 0 && max_members as usize <= Circle::MAX_MEMBERS, HaloError::InvalidMaxMembers);
    require!(contribution_amount > 0, HaloError::InvalidContributionAmount);
    require!(penalty_rate <= 10000, HaloError::InvalidPenaltyRate); // Max 100%

    let circle = &mut ctx.accounts.circle;
    let clock = Clock::get()?;

    circle.creator = ctx.accounts.creator.key();
    circle.id = clock.unix_timestamp as u64;
    circle.contribution_amount = contribution_amount;
    circle.duration_months = duration_months;
    circle.max_members = max_members;
    circle.current_members = 0;
    circle.current_month = 0;
    circle.penalty_rate = penalty_rate;
    circle.status = CircleStatus::Active;
    circle.created_at = clock.unix_timestamp;
    circle.members = Vec::new();
    circle.monthly_contributions = Vec::new();
    circle.total_pot = 0;
    circle.bump = ctx.bumps.circle;

    // Initialize escrow
    let escrow = &mut ctx.accounts.escrow;
    escrow.circle = circle.key();
    escrow.total_amount = 0;
    escrow.monthly_pots = vec![0; duration_months as usize];
    escrow.bump = ctx.bumps.escrow;

    msg!("Circle initialized with ID: {}", circle.id);
    Ok(())
}

pub fn join_circle(ctx: Context<JoinCircle>, stake_amount: u64) -> Result<()> {
    let circle = &mut ctx.accounts.circle;
    let member_account = &mut ctx.accounts.member;
    let clock = Clock::get()?;

    require!(circle.status == CircleStatus::Active, HaloError::CircleNotActive);
    require!(circle.current_members < circle.max_members, HaloError::CircleFull);
    require!(stake_amount >= circle.contribution_amount, HaloError::InsufficientStake);

    // Check if member already exists
    require!(!circle.members.contains(&ctx.accounts.member_authority.key()), HaloError::MemberAlreadyExists);

    // Transfer stake to escrow
    if stake_amount > 0 {
        let cpi_accounts = Transfer {
            from: ctx.accounts.member_token_account.to_account_info(),
            to: ctx.accounts.escrow_token_account.to_account_info(),
            authority: ctx.accounts.member_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, stake_amount)?;
    }

    // Initialize member account
    member_account.authority = ctx.accounts.member_authority.key();
    member_account.circle = circle.key();
    member_account.stake_amount = stake_amount;
    member_account.contribution_history = vec![0; circle.duration_months as usize];
    member_account.status = MemberStatus::Active;
    member_account.has_received_pot = false;
    member_account.penalties = 0;
    member_account.joined_at = clock.unix_timestamp;
    member_account.bump = ctx.bumps.member;

    // Add member to circle
    circle.members.push(ctx.accounts.member_authority.key());
    circle.current_members += 1;

    // Update escrow
    let escrow = &mut ctx.accounts.escrow;
    escrow.total_amount = escrow.total_amount.checked_add(stake_amount).ok_or(HaloError::ArithmeticOverflow)?;

    msg!("Member {} joined circle", ctx.accounts.member_authority.key());
    Ok(())
}

pub fn contribute(ctx: Context<Contribute>, amount: u64) -> Result<()> {
    let circle = &mut ctx.accounts.circle;
    let member = &mut ctx.accounts.member;
    let clock = Clock::get()?;

    require!(circle.status == CircleStatus::Active, HaloError::CircleNotActive);
    require!(member.status == MemberStatus::Active, HaloError::MemberInDefault);
    require!(amount == circle.contribution_amount, HaloError::InvalidContributionAmount);

    // Calculate current month (simple implementation - in practice would use more sophisticated time calculation)
    let months_since_creation = ((clock.unix_timestamp - circle.created_at) / (30 * 24 * 60 * 60)) as u8;
    let current_month = std::cmp::min(months_since_creation, circle.duration_months - 1);
    
    // Update circle's current month
    circle.current_month = current_month;

    // Check if already contributed for this month
    require!(
        current_month < member.contribution_history.len() as u8 && 
        member.contribution_history[current_month as usize] == 0,
        HaloError::ContributionAlreadyMade
    );

    // Transfer contribution to escrow
    let cpi_accounts = Transfer {
        from: ctx.accounts.member_token_account.to_account_info(),
        to: ctx.accounts.escrow_token_account.to_account_info(),
        authority: ctx.accounts.member_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    // Record contribution
    member.contribution_history[current_month as usize] = amount;

    // Update or create monthly contribution record
    if let Some(monthly_contrib) = circle.monthly_contributions.get_mut(current_month as usize) {
        monthly_contrib.contributions.push(MemberContribution {
            member: member.authority,
            amount,
            timestamp: clock.unix_timestamp,
        });
        monthly_contrib.total_collected = monthly_contrib.total_collected
            .checked_add(amount)
            .ok_or(HaloError::ArithmeticOverflow)?;
    } else {
        // Ensure we have enough space in the vector
        while circle.monthly_contributions.len() <= current_month as usize {
            circle.monthly_contributions.push(MonthlyContribution {
                month: circle.monthly_contributions.len() as u8,
                contributions: Vec::new(),
                total_collected: 0,
                distributed_to: None,
            });
        }
        
        let monthly_contrib = &mut circle.monthly_contributions[current_month as usize];
        monthly_contrib.contributions.push(MemberContribution {
            member: member.authority,
            amount,
            timestamp: clock.unix_timestamp,
        });
        monthly_contrib.total_collected = amount;
    }

    // Update totals
    circle.total_pot = circle.total_pot.checked_add(amount).ok_or(HaloError::ArithmeticOverflow)?;
    let escrow = &mut ctx.accounts.escrow;
    escrow.total_amount = escrow.total_amount.checked_add(amount).ok_or(HaloError::ArithmeticOverflow)?;
    escrow.monthly_pots[current_month as usize] = escrow.monthly_pots[current_month as usize]
        .checked_add(amount)
        .ok_or(HaloError::ArithmeticOverflow)?;

    msg!("Contribution of {} made by {} for month {}", amount, member.authority, current_month);
    Ok(())
}

pub fn distribute_pot(ctx: Context<DistributePot>) -> Result<()> {
    let circle = &mut ctx.accounts.circle;
    let recipient_member = &mut ctx.accounts.recipient_member;
    let escrow = &mut ctx.accounts.escrow;
    let clock = Clock::get()?;

    require!(circle.status == CircleStatus::Active, HaloError::CircleNotActive);
    require!(!recipient_member.has_received_pot, HaloError::MemberAlreadyReceivedPot);

    // Calculate current month
    let months_since_creation = ((clock.unix_timestamp - circle.created_at) / (30 * 24 * 60 * 60)) as u8;
    let current_month = std::cmp::min(months_since_creation, circle.duration_months - 1);

    require!(current_month < circle.monthly_contributions.len() as u8, HaloError::NoContributionsToDistribute);

    let monthly_contrib = &mut circle.monthly_contributions[current_month as usize];
    require!(monthly_contrib.distributed_to.is_none(), HaloError::PotAlreadyDistributed);
    require!(monthly_contrib.total_collected > 0, HaloError::NoContributionsToDistribute);

    let pot_amount = monthly_contrib.total_collected;

    // Transfer pot to recipient
    let seeds = &[
        b"escrow",
        circle.key().as_ref(),
        &[escrow.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        to: ctx.accounts.recipient_token_account.to_account_info(),
        authority: ctx.accounts.escrow.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, pot_amount)?;

    // Update records
    monthly_contrib.distributed_to = Some(recipient_member.authority);
    recipient_member.has_received_pot = true;
    escrow.total_amount = escrow.total_amount.checked_sub(pot_amount).ok_or(HaloError::ArithmeticOverflow)?;

    // Check if circle is completed
    if current_month >= circle.duration_months - 1 {
        circle.status = CircleStatus::Completed;
    }

    msg!("Pot of {} distributed to {} for month {}", pot_amount, recipient_member.authority, current_month);
    Ok(())
}

pub fn claim_penalty(ctx: Context<ClaimPenalty>) -> Result<()> {
    let circle = &ctx.accounts.circle;
    let defaulted_member = &mut ctx.accounts.defaulted_member;
    let claimer = &ctx.accounts.claimer;

    require!(circle.status == CircleStatus::Active, HaloError::CircleNotActive);
    require!(defaulted_member.status == MemberStatus::Defaulted, HaloError::MemberNotFound);

    // Calculate penalty based on defaulted amount and penalty rate
    let penalty_amount = defaulted_member.penalties;
    require!(penalty_amount > 0, HaloError::NoContributionsToDistribute);

    // Transfer penalty from escrow to claimer
    let escrow = &mut ctx.accounts.escrow;
    let seeds = &[
        b"escrow",
        circle.key().as_ref(),
        &[escrow.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        to: ctx.accounts.claimer_token_account.to_account_info(),
        authority: ctx.accounts.escrow.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, penalty_amount)?;

    // Update records
    defaulted_member.penalties = 0;
    escrow.total_amount = escrow.total_amount.checked_sub(penalty_amount).ok_or(HaloError::ArithmeticOverflow)?;

    msg!("Penalty of {} claimed by {}", penalty_amount, claimer.key());
    Ok(())
}

pub fn leave_circle(ctx: Context<LeaveCircle>) -> Result<()> {
    let circle = &mut ctx.accounts.circle;
    let member = &mut ctx.accounts.member;
    let clock = Clock::get()?;

    require!(circle.status != CircleStatus::Completed, HaloError::CircleEnded);

    // Calculate if member can leave (simplified - in practice would have more complex rules)
    let months_since_creation = ((clock.unix_timestamp - circle.created_at) / (30 * 24 * 60 * 60)) as u8;
    let current_month = std::cmp::min(months_since_creation, circle.duration_months - 1);

    // Only allow leaving if circle hasn't started active contributions or if member is in default
    require!(
        current_month == 0 || member.status == MemberStatus::Defaulted,
        HaloError::CannotLeaveActivePeriod
    );

    // Return stake if available
    if member.stake_amount > 0 {
        let escrow = &mut ctx.accounts.escrow;
        let seeds = &[
            b"escrow",
            circle.key().as_ref(),
            &[escrow.bump],
        ];
        let signer = &[&seeds[..]];

        let cpi_accounts = Transfer {
            from: ctx.accounts.escrow_token_account.to_account_info(),
            to: ctx.accounts.member_token_account.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, member.stake_amount)?;

        escrow.total_amount = escrow.total_amount.checked_sub(member.stake_amount).ok_or(HaloError::ArithmeticOverflow)?;
    }

    // Update member status
    member.status = MemberStatus::Exited;

    // Remove member from circle
    if let Some(pos) = circle.members.iter().position(|&x| x == member.authority) {
        circle.members.remove(pos);
        circle.current_members -= 1;
    }

    msg!("Member {} left the circle", member.authority);
    Ok(())
}

#[derive(Accounts)]
#[instruction(contribution_amount: u64, duration_months: u8, max_members: u8, penalty_rate: u16)]
pub struct InitializeCircle<'info> {
    #[account(
        init,
        payer = creator,
        space = Circle::space(),
        seeds = [b"circle", creator.key().as_ref(), &Clock::get().unwrap().unix_timestamp.to_le_bytes()],
        bump
    )]
    pub circle: Account<'info, Circle>,
    
    #[account(
        init,
        payer = creator,
        space = CircleEscrow::space(),
        seeds = [b"escrow", circle.key().as_ref()],
        bump
    )]
    pub escrow: Account<'info, CircleEscrow>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(stake_amount: u64)]
pub struct JoinCircle<'info> {
    #[account(mut)]
    pub circle: Account<'info, Circle>,
    
    #[account(
        init,
        payer = member_authority,
        space = Member::space(),
        seeds = [b"member", circle.key().as_ref(), member_authority.key().as_ref()],
        bump
    )]
    pub member: Account<'info, Member>,
    
    #[account(mut)]
    pub escrow: Account<'info, CircleEscrow>,
    
    #[account(mut)]
    pub member_authority: Signer<'info>,
    
    #[account(mut)]
    pub member_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct Contribute<'info> {
    #[account(mut)]
    pub circle: Account<'info, Circle>,
    
    #[account(
        mut,
        seeds = [b"member", circle.key().as_ref(), member_authority.key().as_ref()],
        bump = member.bump
    )]
    pub member: Account<'info, Member>,
    
    #[account(mut)]
    pub escrow: Account<'info, CircleEscrow>,
    
    #[account(mut)]
    pub member_authority: Signer<'info>,
    
    #[account(mut)]
    pub member_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DistributePot<'info> {
    #[account(mut)]
    pub circle: Account<'info, Circle>,
    
    #[account(
        mut,
        seeds = [b"member", circle.key().as_ref(), recipient_member.authority.as_ref()],
        bump = recipient_member.bump
    )]
    pub recipient_member: Account<'info, Member>,
    
    #[account(
        mut,
        seeds = [b"escrow", circle.key().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, CircleEscrow>,
    
    pub authority: Signer<'info>, // Could be circle creator or governance
    
    #[account(mut)]
    pub recipient_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimPenalty<'info> {
    pub circle: Account<'info, Circle>,
    
    #[account(
        mut,
        seeds = [b"member", circle.key().as_ref(), defaulted_member.authority.as_ref()],
        bump = defaulted_member.bump
    )]
    pub defaulted_member: Account<'info, Member>,
    
    #[account(
        mut,
        seeds = [b"escrow", circle.key().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, CircleEscrow>,
    
    pub claimer: Signer<'info>,
    
    #[account(mut)]
    pub claimer_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct LeaveCircle<'info> {
    #[account(mut)]
    pub circle: Account<'info, Circle>,
    
    #[account(
        mut,
        seeds = [b"member", circle.key().as_ref(), member_authority.key().as_ref()],
        bump = member.bump
    )]
    pub member: Account<'info, Member>,
    
    #[account(
        mut,
        seeds = [b"escrow", circle.key().as_ref()],
        bump = escrow.bump
    )]
    pub escrow: Account<'info, CircleEscrow>,
    
    #[account(mut)]
    pub member_authority: Signer<'info>,
    
    #[account(mut)]
    pub member_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}