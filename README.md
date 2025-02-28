# DipHigh Solana Staking Program

This project is Staking management system on Solana.
Token is SPL-TOKEN standard.

Try running some of the following tasks:

### Environment

```shell
Node Version: 22
Yarn Version: 1.22.22
Anchor Version: 0.29.0
Rust Version: 1.84.0
Cargo Version: 1.84.0
```

### Module Install

```shell
npm i
```

### Validator Execute

```shell
solana-test-validator
```

### Compile

```shell
anchor keys list
anchor keys sync
anchor build
```
The result will be
```shell
   Compiling serde_derive v1.0.217
   Compiling thiserror-impl v1.0.69
   Compiling borsh-derive v1.5.5
   Compiling solana-frozen-abi-macro v1.18.26
   Compiling bytemuck_derive v1.8.1
   Compiling solana-sdk-macro v1.18.26      
   Compiling num-derive v0.4.2
   Compiling spl-program-error-derive v0.3.2
   Compiling num_enum_derive v0.7.3
   Compiling num-derive v0.3.3
   Compiling anchor-derive-space v0.29.0
   Compiling num_enum v0.7.3
   Compiling thiserror v1.0.69
   Compiling spl-discriminator-syn v0.1.2
   Compiling spl-discriminator-derive v0.1.2
   Compiling bytemuck v1.21.0
   Compiling borsh v1.5.5
   Compiling serde v1.0.217
   Compiling bv v0.11.1
   Compiling serde_bytes v0.11.15
   Compiling serde_json v1.0.137
   Compiling bincode v1.3.3
   Compiling toml v0.5.11
   Compiling solana-frozen-abi v1.18.26
   Compiling proc-macro-crate v0.1.5
   Compiling anchor-syn v0.29.0
   Compiling borsh-derive v0.9.3
   Compiling borsh-derive v0.10.4
   Compiling borsh v0.9.3
   Compiling borsh v0.10.4
   Compiling solana-program v1.18.26
   Compiling anchor-attribute-error v0.29.0
   Compiling anchor-attribute-event v0.29.0
   Compiling anchor-attribute-access-control v0.29.0
   Compiling anchor-attribute-program v0.29.0
   Compiling anchor-attribute-account v0.29.0
   Compiling anchor-derive-accounts v0.29.0
   Compiling anchor-attribute-constant v0.29.0
   Compiling anchor-derive-serde v0.29.0
   Compiling spl-program-error v0.3.0
   Compiling solana-zk-token-sdk v1.18.26
   Compiling spl-discriminator v0.1.0
   Compiling spl-token v4.0.3
   Compiling spl-memo v4.0.4
   Compiling mpl-token-metadata v3.2.3
   Compiling spl-pod v0.1.0
   Compiling spl-type-length-value v0.3.0
   Compiling spl-token-group-interface v0.1.0
   Compiling spl-tlv-account-resolution v0.5.1
   Compiling spl-token-metadata-interface v0.2.0
   Compiling spl-tlv-account-resolution v0.4.0
   Compiling anchor-lang v0.29.0
   Compiling spl-transfer-hook-interface v0.3.0
   Compiling spl-transfer-hook-interface v0.4.1
   Compiling spl-token-2022 v1.0.0
   Compiling spl-token-2022 v0.9.0
   Compiling spl-associated-token-account v2.3.0
   Compiling anchor-spl v0.29.0
   Compiling staking-contract v0.1.0 (/mnt/e/development/git/Staking-Contract/programs/staking-contract)
    Finished release [optimized] target(s) in 1m 07s
```
### Test Code Execute

```shell
anchor test
```

The result will be 

```shell

Found a 'test' script in the Anchor.toml. Running it as a test suite!

Running test suite: "/mnt/e/development/git/Staking-Contract/Anchor.toml"

yarn run v1.22.22
warning package.json: No license field
$ /mnt/e/development/git/Staking-Contract/node_modules/.bin/ts-mocha -p ./tsconfig.json 
-t 1000000 tests/test-staking-contract.ts
bigint: Failed to load bindings, pure JS will be used (try npm run rebuild?)
mint => mntExBDxsFPNgWGvaiv11d3FzeSwehgcMKAFiwx3n7M
(node:9703) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
(Use `node --trace-deprecation ...` to show where the warning was created)


  test staking-contract with admin
    ✔ Airdrop SOL to test users (1139ms)
Using provider: oyswBARH6natoQZ4zJGMbWjyxvEGwX5NLTQQVsQMFRD
Derived Token Account: 7BRmum9ihLfWmmHYb2UyskPtrDjRzN5wNKYao5q3ATmC
    ✔ Create Token (52ms)
Associated Token Account: 21NpX7ra2wQeazEKKzZf4i87F4HhhqwXhbnMv9BthS8u
    ✔ Transfer Token from admin to user1 (899ms)
Associated Token Account: ELqXezJopoHs18NB3CFuWG8RgXEVNU4Hu2VAwZYmd5q
    ✔ Transfer Token from admin to user2 (987ms)
Associated Token Account: 2psbMmq1UhP31V2CEYodrB6LKADq1N2Ekr4E7WKDz7YX
    ✔ Transfer Token from admin to user3 (985ms)

  test staking-contract with user1
tx =>  5ye8maNLuThyrPn4Mi31CmVYZNviguTRnav5v7QZH6y4g6cpCYsoo22MxeAZZ94ughfKnV2pNh2S1cYtsY1TVy2p
    ✔ Deposite token in contract (979ms)
    ✔ Restake token in PDA
    ✔ Withdraw token in PDA


  9 passing (5s)

Done in 6.46s.
```