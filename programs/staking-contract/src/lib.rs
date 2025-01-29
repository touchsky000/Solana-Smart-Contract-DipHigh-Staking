use anchor_lang::prelude::*;
use anchor_spl::{
    token::{
        Token,
        TokenAccount,
        Mint
    },
    associated_token::AssociatedToken,
    metadata::{
        mpl_token_metadata::types::DataV2
    },
};

declare_id!("8aspyEwJyJWnWffoCN36iA5asxXKi1aNjwbTQyQazBDs");

#[program]
pub mod staking_contract {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn create_token(ctx: Context<CreateToken>, decimals: u8, amount: u64) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct CreateToken <'info> {
    #[account(mut)]
    pub mint_token: Signer<'info>
}

