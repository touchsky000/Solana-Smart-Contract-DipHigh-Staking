// const LOCK_TIME: u64 = 100; // day
// const DECIMAL: u64 = 6;
// pub fn to_bn (number: u64) -> u64 {
//     number.saturating_mul(10_u64.pow(DECIMAL.try_into().unwrap()))
// }

pub fn is_unlock(start_stamp: u64, current_stamp: u64, lock_time: u64) -> bool {
    if current_stamp - start_stamp > lock_time * (3600 as u64) * (24 as u64) {
        return true;
    } else {
        return false
    }
}

