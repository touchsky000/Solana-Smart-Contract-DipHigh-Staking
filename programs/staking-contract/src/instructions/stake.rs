use anchor_lang::prelude::*;
use anchor_spl::{
    token,
};
use crate::state::*;

pub fn deposite_token_pda(ctx:Context<DepositeTokenPda>, amount: u64) -> Result<()>{
    let user_info_maker = &mut ctx.accounts.user_info_maker;
    let admin_manager = &mut ctx.accounts.admin_manager;


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
    admin_manager.total_supply = admin_manager.total_supply + amount;
    Ok(())
}

pub fn claim_token_pda(ctx:Context<ClaimTokenPda>, amount: u64) -> Result<()>{
    let admin_manager = &mut ctx.accounts.admin_manager;
    let user_info_maker = &mut ctx.accounts.user_info_maker;
    // let clock = Clock::get()?;
    
    // let clock = Clock::get()?;
    
    let seeds = &[b"token_vault".as_ref(), &[ctx.bumps.token_vault]];
    let signer_seeds = &[&seeds[..]];

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


    user_info_maker.amount = user_info_maker.amount - amount;
    admin_manager.total_supply = admin_manager.total_supply - amount;
    Ok(())
}