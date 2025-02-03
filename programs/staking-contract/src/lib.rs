use crate::instructions::*;
use anchor_lang::prelude::*;
mod instructions;

declare_id!("DdxfS4eSxRLZ8FuY5zVgwmDS28Ydn9pAoxK5jGtZTzBJ");

#[program]
pub mod staking_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let user_info_maker = &mut ctx.accounts.user_info_maker;
        user_info_maker.bump = ctx.bumps.user_info_maker;
        Ok(())
    }

    pub fn create_token(ctx: Context<CreateToken>, decimals: u8, amount: u64) -> Result<()> {
        let _ = instructions::token_mint(ctx, decimals, amount);
        Ok(())
    }

    pub fn token_transfer(ctx: Context<TransferSplToken>, amount: u64) -> Result<()> {
        let _ = instructions::token_transfer(ctx, amount);
        Ok(())
    }

    pub fn deposite_token(ctx:Context<DepositeTokenPda>, amount: u64) -> Result<()> {
        let _ = instructions::deposite_token_pda(ctx , amount);
        Ok(())
    }

    pub fn claim_reward_token(ctx:Context<ClaimTokenPda>, amount: u64) -> Result<()> {
        let _ = instructions::claim_token_pda(ctx, amount);
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
    ///CHECK:
    #[account(
        init,
        payer = user,
        space = 8 * 100,
        seeds = [b"token_vault".as_ref()],
        bump
    )]
    pub token_vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}


