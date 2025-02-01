use anchor_lang::prelude::*;
use anchor_spl::{
    token,
    associated_token
};


pub fn stake_token(ctx:Context<StakeSplToken>, amount: u64) -> Result<()>{
    let user_info_maker = &mut ctx.accounts.user_info_maker;
    // let clock = Clock::get()?;

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_account = token::Transfer{
        authority: ctx.accounts.signer.to_account_info(),
        from: ctx.accounts.from_account.to_account_info(),
        to: ctx.accounts.to_account.to_account_info()
    };
    let cpi_ctx = CpiContext::new(
        cpi_program,
        cpi_account
    );
    token::transfer(
        cpi_ctx,
        amount
    )?;

    user_info_maker.amount = user_info_maker.amount + amount;

    Ok(())
}

pub fn unstake_token(ctx:Context<UnStakeSplToken>, amount: u64) -> Result<()>{
    let user_info_maker = &mut ctx.accounts.user_info_maker;
    // let clock = Clock::get()?;

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_account = token::Transfer{
        authority: ctx.accounts.signer.to_account_info(),
        from: ctx.accounts.from_account.to_account_info(),
        to: ctx.accounts.to_account.to_account_info()
    };
    let cpi_ctx = CpiContext::new(
        cpi_program,
        cpi_account
    );
    token::transfer(
        cpi_ctx,
        amount
    )?;

    user_info_maker.amount = user_info_maker.amount - amount;

    Ok(())
}



#[derive(Accounts)]
#[instruction()]
pub struct StakeSplToken<'info> {
    #[account(mut)]
    pub mint_token:Account<'info, token::Mint>,
    #[account(mut)]
    pub from_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub to_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user_info_maker"], // optional seeds for pda
        bump = user_info_maker.bump, 
    )]
    pub user_info_maker: Account<'info, UserInfoMaker>,
    pub system_program:Program<'info, System>,
    pub token_program:Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}


#[derive(Accounts)]
#[instruction()]
pub struct UnStakeSplToken<'info> {
    #[account(mut)]
    pub mint_token:Account<'info, token::Mint>,
    #[account(mut)]
    pub from_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub to_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"user_info_maker"], // optional seeds for pda
        bump = user_info_maker.bump, 
    )]
    pub user_info_maker: Account<'info, UserInfoMaker>,
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

// #[account]
// #[derive(InitSpace)]
// pub struct StakeToken{
//     pub native_coin: Account<'info, TokenAccount>,

// }
