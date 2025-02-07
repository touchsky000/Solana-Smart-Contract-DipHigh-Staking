use anchor_lang::prelude::*;
use anchor_lang::InitSpace;
use anchor_spl::{
    token,
    associated_token
};

#[account]
#[derive(InitSpace)]
pub struct UserInfoMaker{
    pub amount: u64,
    pub bump: u8
}

#[account]
#[derive(InitSpace)]
pub struct AdminManager{
    pub total_supply: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserHistory{
    #[max_len(400)]
    pub staking_amount: Vec<u64>,
    #[max_len(400)]
    pub staking_start: Vec<u64>,
    #[max_len(400)]
    pub staking_end: Vec<u64>,
    pub bump :u8
}

#[derive(Accounts)]
#[instruction()]
pub struct CreateToken<'info> {
    #[account(mut)]
    pub mint_token:Signer<'info>,
    #[account(mut)]
    pub signer:Signer<'info>,
    ///CHECK:
    #[account(mut)]
    pub token_account:AccountInfo<'info>,
    pub system_program:Program<'info,System>,
    pub token_program:Program<'info,token::Token>,
    pub associated_token_program:Program<'info,associated_token::AssociatedToken>,
    pub rent:Sysvar<'info,Rent>
}


#[derive(Accounts)]
#[instruction()]
pub struct TransferSplToken<'info> {
    #[account(mut)]
    pub mint_token:Account<'info, token::Mint>,
    #[account(mut)]
    pub from_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub to_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program:Program<'info, System>,
    pub token_program:Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}


#[derive(Accounts)]
#[instruction()]
pub struct DepositeTokenPda<'info> {

    #[account(mut)]
    pub mint_token: Account<'info, token::Mint>,
    
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
        init_if_needed,
        payer = signer,
        space = 8 + UserInfoMaker::INIT_SPACE,
        seeds = [b"user_info_maker".as_ref(), mint_token.key().as_ref()], // optional seeds for pda
        bump, 
    )]
    pub user_info_maker: Account<'info, UserInfoMaker>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 * 100,
        seeds = [b"user_history", mint_token.key().as_ref() ,signer.key().as_ref()],
        bump
    )]
    pub user_history: Account<'info, UserHistory>,
    pub token_program:Program<'info, token::Token>,
    pub system_program:Program<'info, System>,
}


#[derive(Accounts)]
#[instruction()]
pub struct ClaimTokenPda<'info> {
    #[account(mut)]
    pub mint_token: Account<'info, token::Mint>,
    #[account(mut)]
    pub user_ata: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub token_vault_ata: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + UserInfoMaker::INIT_SPACE,
        seeds = [b"user_info_maker".as_ref(), mint_token.key().as_ref()], // optional seeds for pda
        bump, 
    )]
    pub user_info_maker: Account<'info, UserInfoMaker>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 * 100,
        seeds = [b"user_history", mint_token.key().as_ref() ,signer.key().as_ref()],
        bump
    )]
    pub user_history: Account<'info, UserHistory>,
    
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

#[derive(Accounts)]
#[instruction()]
pub struct WithDrawToken<'info> {
    #[account(mut)]
    pub mint_token: Account<'info, token::Mint>,
    #[account(mut)]
    pub user_ata: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub token_vault_ata: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init_if_needed,
        payer = signer,
        space = 8 + UserInfoMaker::INIT_SPACE,
        seeds = [b"user_info_maker".as_ref(), mint_token.key().as_ref()], // optional seeds for pda
        bump, 
    )]
    pub user_info_maker: Account<'info, UserInfoMaker>,

    #[account(
        init_if_needed,
        payer = signer,
        space = 8 * 100,
        seeds = [b"user_history", mint_token.key().as_ref() ,signer.key().as_ref()],
        bump,
    )]
    pub user_history: Account<'info, UserHistory>,

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

#[error_code]
pub enum StakingError {
    #[msg("TokenLocked")]
    TokenLocked,
    #[msg("Active vesting period exists")]
    ActiveVestingExists,
    #[msg("Allocation amount too large")]
    AllocationAmountTooLarge,
    #[msg("Sale not started")]
    SaleNotStarted,
    #[msg("Sale not ended")]
    SaleNotEnded,
}