use anchor_lang::error_code;

#[error_code]
pub enum StakingError {
    #[msg("TokenLocked")]
    TokenLocked,
    #[msg("Rewards can only be received once per day.")]
    NotDaily,
    #[msg("Allocation amount too large")]
    AllocationAmountTooLarge,
    #[msg("Sale not started")]
    SaleNotStarted,
    #[msg("Sale not ended")]
    SaleNotEnded,
}