use anchor_lang::prelude::*;
use anchor_spl::{
    token,
    associated_token,
};

declare_id!("8aspyEwJyJWnWffoCN36iA5asxXKi1aNjwbTQyQazBDs");

#[program]
pub mod staking_contract {
    use super::*;
    use anchor_lang::system_program;
    use anchor_spl::token;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }

    pub fn create_token(ctx: Context<CreateToken>, decimals: u8, amount: u64) -> Result<()> {

        let cpi_system_program = ctx.accounts.system_program.to_account_info();
        let cpi_system_account = system_program::CreateAccount {
            from: ctx.accounts.signer.to_account_info(),
            to: ctx.accounts.mint_token.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(
            cpi_system_program,
            cpi_system_account
        );

        system_program::create_account(
            cpi_ctx, 
            10_000_000, 
            82,
            ctx.accounts.token_program.key 
        )?;

        let cpi_initialize_mint_program = ctx.accounts.token_program.to_account_info();
        let cpi_initialize_mint_account = token::InitializeMint{
            mint: ctx.accounts.mint_token.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        };

        let cpi_initialmint_ctx = CpiContext::new(
            cpi_initialize_mint_program,
            cpi_initialize_mint_account,
        );

        let _ = token::initialize_mint(
            cpi_initialmint_ctx,
            decimals,
            ctx.accounts.signer.key,
            Some(ctx.accounts.signer.key)
        );


        let cpi_associated_token_program = ctx.accounts.associated_token_program.to_account_info();

        let cpi_associated_token_account = associated_token::Create{
            payer: ctx.accounts.signer.to_account_info(),
            associated_token: ctx.accounts.token_account.to_account_info(),
            authority: ctx.accounts.signer.to_account_info(),
            mint: ctx.accounts.mint_token.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            token_program: ctx.accounts.token_program.to_account_info(),   
        };

        let cpi_associated_token_ctx = CpiContext::new(
            cpi_associated_token_program,
            cpi_associated_token_account
        );

        associated_token::create(cpi_associated_token_ctx)?;

        let cpi_mint_program = ctx.accounts.token_account.to_account_info();
        let cpi_mint_account = token::MintTo{
            authority: ctx.accounts.signer.to_account_info(),
            mint: ctx.accounts.mint_token.to_account_info(),
            to: ctx.accounts.token_account.to_account_info()
        };

        let cpi_mint_ctx = CpiContext::new(
            cpi_mint_program,
            cpi_mint_account
        );

        token::mint_to(
            cpi_mint_ctx,
            amount
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
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