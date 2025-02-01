use crate::library::*;
use anchor_lang::prelude::*;
mod library;

declare_id!("76atSBbYCM5ZYro4E5PCU7oJEzYtoThDnYHWnvLi168M");

#[program]
pub mod staking_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let user_info_maker = &mut ctx.accounts.user_info_maker;
        user_info_maker.bump = ctx.bumps.user_info_maker;
        Ok(())
    }

    pub fn create_token(ctx: Context<CreateToken>, decimals: u8, amount: u64) -> Result<()> {
        let _ = token_mint(ctx, decimals, amount);
        Ok(())
    }

    pub fn transfer_spl_token(ctx:Context<TransferSplToken>, amount: u64) -> Result<()> {
        let _ = token_transfer(ctx , amount);
        Ok(())
    }

    pub fn stake_spl_token(ctx:Context<StakeSplToken>, amount: u64) -> Result<()> {
        let _ = stake_token(ctx, amount);
        Ok(())
    }

    pub fn unstake_spl_token(ctx:Context<UnStakeSplToken>, amount: u64) -> Result<()> {
        let _ = unstake_token(ctx, amount);
        Ok(())
    }
}


#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user:Signer<'info>,
    #[account(
        init,
        seeds = [b"user_info_maker"],
        bump,
        payer = user,
        space = 8 + UserInfoMaker::INIT_SPACE
    )]
    pub user_info_maker: Account<'info, UserInfoMaker>,
    pub system_program: Program<'info, System>,
}


