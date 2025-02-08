use crate::instructions::*;
use anchor_spl::token;
use anchor_lang::prelude::*;
mod instructions;

declare_id!("GnK7Z56HpSARf4CjArm4ymNrbwfE8Fw8984kTgXxrXzW");

#[program]
pub mod staking_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let user_info_maker = &mut ctx.accounts.user_info_maker;
        user_info_maker.bump = ctx.bumps.user_info_maker;
        Ok(())
    }
    
    pub fn create_token(ctx: Context<CreateToken>, decimals: u8, amount: u64) -> Result<()> {
        let _ = instructions::token_mint(ctx, decimals, amount)?;
        Ok(())
    }
    
    pub fn token_transfer(ctx: Context<TransferSplToken>, amount: u64) -> Result<()> {
        let _ = instructions::token_transfer(ctx, amount)?;
        Ok(())
    }
    
    pub fn deposite_token(ctx:Context<DepositeTokenPda>, amount: u64, period: u64, apy: u64) -> Result<()> {
        let _ = instructions::deposite_token_pda(ctx , amount, period, apy)?;
        Ok(())
    }
    
    pub fn claim_reward_token(ctx:Context<ClaimTokenPda>, index: u64) -> Result<()> {
        let _ = instructions::claim_reward(ctx, index)?;
        Ok(())
    }

    pub fn withdraw_token(ctx:Context<WithDrawToken>, index: u64) -> Result<()> {
        let _ = instructions::withdraw_token(ctx, index)?;
        Ok(())
    }
    
    pub fn test(_ctx: Context<Test>) -> Result<()> {
        Ok(())
    }
    
    pub fn initialize_user_history(ctx: Context<InitializeUserHistory>) -> Result<()> {
        let user_history = &mut ctx.accounts.user_history;
        user_history.bump = ctx.bumps.user_history;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUserHistory<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub mint_token: Account<'info, token::Mint>,
    #[account(
        init,
        seeds = [b"user_history", mint_token.key().as_ref() ,user.key().as_ref()],
        bump,
        payer = user,
        space = 100 + 3 * 8 * 400,
    )]
    pub user_history: Account<'info, UserHistory>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Test<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut)]
    pub mint_token: Account<'info, token::Mint>,
    #[account(
        mut,
        seeds = [b"user_info_maker".as_ref(), mint_token.key().as_ref()], // optional seeds for pda
        bump = user_info_maker.bump, 
    )]
    pub user_info_maker: Account<'info, UserInfoMaker>,
}


#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user:Signer<'info>,
    #[account(mut)]
    pub mint_token: Account<'info, token::Mint>,
    #[account(
        init,
        seeds = [b"user_info_maker".as_ref(), mint_token.key().as_ref()],
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


