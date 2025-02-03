use anchor_lang::prelude::*;
use anchor_spl::{
    token,
    associated_token
};

pub fn deposite_token_pda(ctx:Context<DepositeTokenPda>, amount: u64) -> Result<()>{
    let user_info_maker = &mut ctx.accounts.user_info_maker;

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

    Ok(())
}

pub fn claim_token_pda(ctx:Context<ClaimTokenPda>, amount: u64) -> Result<()>{
    let user_info_maker = &mut ctx.accounts.user_info_maker;
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

    Ok(())
}

#[derive(Accounts)]
#[instruction(amount: u64)]
pub struct DepositeTokenPda<'info> {
    #[account(mut)]
    pub user_ata: Account<'info, token::TokenAccount>,
    ///CHECK:
    #[account(
        mut,
        seeds = [b"token_vault".as_ref()],
        bump
    )]
    pub token_vault: AccountInfo<'info>,
    #[account(mut)]
    pub token_vault_ata: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"user_info_maker".as_ref()], // optional seeds for pda
        bump = user_info_maker.bump, 
    )]
    pub user_info_maker: Account<'info, UserInfoMaker>,
    pub token_program:Program<'info, token::Token>,
}


#[derive(Accounts)]
#[instruction()]
pub struct ClaimTokenPda<'info> {
    #[account(mut)]
    pub user_ata: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub token_vault_ata: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user_info_maker".as_ref()], // optional seeds for pda
        bump = user_info_maker.bump, 
    )]
    pub user_info_maker: Account<'info, UserInfoMaker>,
    ///CHECK:
    #[account(
        mut,
        seeds = [b"token_vault".as_ref()],
        bump
    )]
    pub token_vault: AccountInfo<'info>,
    
    pub system_program:Program<'info, System>,
    pub token_program:Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}

#[account]
#[derive(InitSpace)]
pub struct UserInfoMaker{
    pub amount: u64,
    pub bump: u8
}
