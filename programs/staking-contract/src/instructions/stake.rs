use anchor_lang::prelude::*;
use anchor_spl::{
    token,
};
use crate::instructions::*;

pub fn deposite_token_pda(ctx:Context<DepositeTokenPda>, amount: u64, period: u64, apy: u64) -> Result<()>{
    let user_info_maker = &mut ctx.accounts.user_info_maker;
    let user_history = &mut ctx.accounts.user_history;
    let current_timestamp = Clock::get().unwrap().unix_timestamp;

    let seeds = &[b"token_vault".as_ref(), &[ctx.bumps.token_vault]];
    let signer_seeds =&[&seeds[..]];

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_account = token::Transfer{
        authority: ctx.accounts.signer.to_account_info(),
        from: ctx.accounts.user_ata.to_account_info(),
        to: ctx.accounts.token_vault_ata.to_account_info()
    };
    let cpi_ctx = CpiContext::new_with_signer(
        cpi_program, 
        cpi_account,
        signer_seeds
    );

    token::transfer(
        cpi_ctx,
        amount
    )?;

    user_info_maker.amount = user_info_maker.amount + amount;

    user_history.staking_amount.push(amount.try_into().unwrap());
    user_history.staking_start.push(current_timestamp.try_into().unwrap());
    user_history.staking_end.push(0.try_into().unwrap());
    user_history.claim_date.push(0.try_into().unwrap());
    user_history.staking_period.push(period.try_into().unwrap());
    user_history.staking_apy.push(apy.try_into().unwrap());
    Ok(())
}

pub fn claim_reward(ctx:Context<ClaimTokenPda>, index: u64) -> Result<()>{
    let user_info_maker = &mut ctx.accounts.user_info_maker;
    let user_history = &mut ctx.accounts.user_history;
    let current_timestamp = Clock::get().unwrap().unix_timestamp;
    let seeds = &[b"token_vault".as_ref(), &[ctx.bumps.token_vault]];
    let signer_seeds = &[&seeds[..]];
    let period: u64 =  user_history.staking_period[index as usize] as u64;
    let claim_date: u64 = user_history.claim_date[index as usize] as u64;
    let reward_amount: u64 = user_history.staking_amount[index as usize] as u64;
    let reward_apy: u64 = user_history.staking_apy[index as usize] as u64;
    let amount: u64 = reward_amount * reward_apy / (100 as u64) ;

    require!( 
        is_unlock(user_history.staking_start[index as usize], current_timestamp.try_into().unwrap(), period) ,
        StakingError::TokenLocked
    );
    
    require!(
        is_available_daily(current_timestamp.try_into().unwrap(), claim_date),
        
    )
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_account = token::Transfer{
        authority: ctx.accounts.token_vault.to_account_info(),
        from: ctx.accounts.token_vault_ata.to_account_info(),
        to: ctx.accounts.user_ata.to_account_info()
    };
    let cpi_ctx = CpiContext::new_with_signer(
        cpi_program,
        cpi_account,
        signer_seeds
    );
    token::transfer(
        cpi_ctx,
        amount
    )?;

    user_info_maker.amount = user_info_maker.amount - amount;

    Ok(())
}

pub fn withdraw_token(ctx:Context<WithDrawToken>, index: u64) -> Result<()>{
    let user_info_maker = &mut ctx.accounts.user_info_maker;
    let user_history = &mut ctx.accounts.user_history;
    let current_timestamp = Clock::get().unwrap().unix_timestamp;
    let period: u64 =  user_history.staking_period[index as usize] as u64;

    require!( is_unlock(user_history.staking_start[index as usize], current_timestamp.try_into().unwrap(), period) ,
            StakingError::TokenLocked
    );

    if user_history.staking_end[index as usize] == 0 {
        let seeds = &[b"token_vault".as_ref(), &[ctx.bumps.token_vault]];
        let signer_seeds = &[&seeds[..]];
        let amount_bn: u64 = user_history.staking_amount[index as usize];
        
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_account = token::Transfer{
            authority: ctx.accounts.token_vault.to_account_info(),
            from: ctx.accounts.token_vault_ata.to_account_info(),
            to: ctx.accounts.user_ata.to_account_info()
        };
        let cpi_ctx = CpiContext::new_with_signer(
            cpi_program,
            cpi_account,
            signer_seeds
        );
        token::transfer(
            cpi_ctx,
            amount_bn
        )?;
    
        user_info_maker.amount = user_info_maker.amount - amount_bn;
        user_history.staking_end[index as usize] = current_timestamp.try_into().unwrap();
    
        Ok(())
    } else {
        msg!("already withdraw");
        Ok(())
    }
}



