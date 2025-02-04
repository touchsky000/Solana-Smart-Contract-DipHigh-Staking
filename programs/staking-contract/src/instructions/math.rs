const LOCK_TIME: u64 = 100; // day

pub fn to_bn (number: u64) -> u64 {
    number.saturating_mul(10_u64.pow(9))
}

pub fn is_unlock(start_stamp: u64, current_stamp: u64) -> bool {
    if current_stamp - start_stamp > LOCK_TIME * (3600 as u64) * (24 as u64) {
        return true;
    } else {
        return false
    }
}