pub fn to_bn (number: u64) -> u64 {
    number.saturating_mul(10_u64.pow(9))
}