import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { IDL, StakingContract } from "../target/types/staking_contract";
import {
  Keypair,
  PublicKey,
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js"
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import { assert } from "chai"
import {
  derivePDA,
  transfer_token,
  stake_token,
  create_Token,
  transfer_token_user_to_user,
  getTokenBalance,
  create_Token_with_provider,
  claim_token,
  convertToBN,
  convertFromHextToInt,
  withdraw_token
} from "./token_control";

describe("test staking-contract with admin", async () => {
  const user1 = Keypair.fromSecretKey(Uint8Array.from(require('./us1hbhq71B8B865ARa3NkYfKn8fwn771bgMZdCdzyiy.json')))
  const user2 = Keypair.fromSecretKey(Uint8Array.from(require('./us2P2tY6Tf8T5cacUJ8NzmA6mmxS2bDh7onftgGJaty.json')))
  const user3 = Keypair.fromSecretKey(Uint8Array.from(require('./us3LpDfaodp916sYrQdW13jbKT2ptZjNdb3Hcm6xvPu.json')))
  console.log("user1 =>", user1.publicKey.toBase58())
  console.log("user2 =>", user2.publicKey.toBase58())
  console.log("user3 =>", user3.publicKey.toBase58())

  const adminProvider = anchor.AnchorProvider.env()
  const user1Provider = new anchor.AnchorProvider(
    adminProvider.connection, // You can use the same connection
    new anchor.Wallet(user1),
    adminProvider.opts
  );
  const user2Provider = new anchor.AnchorProvider(
    adminProvider.connection,
    new anchor.Wallet(user2),
    adminProvider.opts
  )
  const user3Provider = new anchor.AnchorProvider(
    adminProvider.connection,
    new anchor.Wallet(user3),
    adminProvider.opts
  )

  anchor.setProvider(adminProvider)
  // anchor.setProvider(user1Provider)

  const program = anchor.workspace.StakingContract as Program<StakingContract>;
  const mintToken = Keypair.fromSecretKey(Uint8Array.from(require('./mntbAn7t5u6WuPcksPeWE7k5F1cfFXzEgsByqSFWzsW.json')));



  // it("Airdrop SOL to test users", async () => {

  //   const airdropAmount = 100 * LAMPORTS_PER_SOL
  //   const sign1 = await user1Provider.connection.requestAirdrop(user1.publicKey, airdropAmount)
  //   const sign2 = await user2Provider.connection.requestAirdrop(user2.publicKey, airdropAmount)
  //   const sign3 = await user3Provider.connection.requestAirdrop(user3.publicKey, airdropAmount)

  //   await adminProvider.connection.confirmTransaction(sign1)
  //   await adminProvider.connection.confirmTransaction(sign2)
  //   await adminProvider.connection.confirmTransaction(sign3)

  //   const balanceUser1 = await adminProvider.connection.getBalance(user1.publicKey)
  //   const balanceUser2 = await adminProvider.connection.getBalance(user2.publicKey)
  //   const balanceUser3 = await adminProvider.connection.getBalance(user3.publicKey)
  // });

  it("get pda", async () => {
    const provider = adminProvider
    const pda = await derivePDA(
      mintToken.publicKey,
      provider.wallet.publicKey,
      program.programId
    )
  })

  // it("Is pda acc initialized!", async () => {
  //   const [userInfoPDA] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("user_info_maker")],
  //     program.programId
  //   )
  //   try {
  //     const txSig = await program.methods
  //       .initialize()
  //       .accounts({
  //         userInfoMaker: userInfoPDA,
  //       })
  //       .rpc();
  //     const accountData = await program.account.userInfoMaker.fetch(userInfoPDA);
  //     // console.log(`Transaction Signature: ${txSig}`);
  //     // console.log(`amount: ${accountData.amount}`);
  //   } catch (error) {
  //     // If PDA Account already created, then we expect an error
  //     // console.log("already initialized")
  //   }
  // });

  // it("Create Token", async () => {
  //   const decimal = 9
  //   const amount = new anchor.BN("100000000000000000")
  //   const tx = await create_Token(
  //     program,
  //     adminProvider,
  //     mintToken.publicKey,
  //     mintToken,
  //     decimal,
  //     amount,
  //   )
  //   // console.log("tx =>", tx)
  // })

  it("Transfer Token from admin to user1", async () => {
    const amount = 100000
    const provider = adminProvider
    const programStandard = TOKEN_2022_PROGRAM_ID;
    const MINT_ADDRESS = mintToken.publicKey
    const FROM_ADDRESS = provider.wallet.publicKey
    const TO_ADDRESS = user1.publicKey

    const tx = await transfer_token(
      provider,
      program,
      MINT_ADDRESS,
      FROM_ADDRESS,
      TO_ADDRESS,
      amount,
      programStandard
    )

    // console.log(`token ${MINT_ADDRESS} transfer ${amount} to user1: ${TO_ADDRESS}`)

    const balance = await getTokenBalance(
      provider.connection,
      TO_ADDRESS,
      mintToken.publicKey,
    )
    // console.log("user balance =>", balance)
  })

  it("Transfer Token from admin to user2", async () => {
    const amount = 100000
    const provider = adminProvider
    const programStandard = TOKEN_2022_PROGRAM_ID;
    const MINT_ADDRESS = mintToken.publicKey
    const FROM_ADDRESS = provider.wallet.publicKey
    const TO_ADDRESS = user2.publicKey

    const tx = await transfer_token(
      provider,
      program,
      MINT_ADDRESS,
      FROM_ADDRESS,
      TO_ADDRESS,
      amount,
      programStandard
    )

    // console.log(`token ${MINT_ADDRESS} transfer ${amount} to user2: ${TO_ADDRESS}`)

    const balance = await getTokenBalance(
      provider.connection,
      TO_ADDRESS,
      mintToken.publicKey,
    )
    // console.log("user balance =>", balance)
  })

  it("Transfer Token from admin to user3", async () => {
    const amount = 100000
    const provider = adminProvider
    const programStandard = TOKEN_2022_PROGRAM_ID;
    const MINT_ADDRESS = mintToken.publicKey
    const FROM_ADDRESS = provider.wallet.publicKey
    const TO_ADDRESS = user3.publicKey

    const tx = await transfer_token(
      provider,
      program,
      MINT_ADDRESS,
      FROM_ADDRESS,
      TO_ADDRESS,
      amount,
      programStandard
    )

    // console.log(`token ${MINT_ADDRESS} transfer ${amount} to user2: ${TO_ADDRESS}`)

    const balance = await getTokenBalance(
      provider.connection,
      TO_ADDRESS,
      mintToken.publicKey,
    )
    // console.log("user balance =>", balance)
  })
});



// describe("test staking-contract with user1", async () => {
//   const user1 = Keypair.fromSecretKey(Uint8Array.from(require('./us1hbhq71B8B865ARa3NkYfKn8fwn771bgMZdCdzyiy.json')))
//   const user2 = Keypair.fromSecretKey(Uint8Array.from(require('./us2P2tY6Tf8T5cacUJ8NzmA6mmxS2bDh7onftgGJaty.json')))
//   const user3 = Keypair.fromSecretKey(Uint8Array.from(require('./us3LpDfaodp916sYrQdW13jbKT2ptZjNdb3Hcm6xvPu.json')))
//   const mintToken = Keypair.fromSecretKey(Uint8Array.from(require('./mntbAn7t5u6WuPcksPeWE7k5F1cfFXzEgsByqSFWzsW.json')));
//   console.log("user1 =>", user1.publicKey.toBase58())
//   console.log("user2 =>", user2.publicKey.toBase58())
//   console.log("user3 =>", user3.publicKey.toBase58())

//   const adminProvider = anchor.AnchorProvider.env()
//   const user1Provider = new anchor.AnchorProvider(
//     adminProvider.connection, // You can use the same connection
//     new anchor.Wallet(user1),
//     adminProvider.opts
//   );
//   const user2Provider = new anchor.AnchorProvider(
//     adminProvider.connection,
//     new anchor.Wallet(user2),
//     adminProvider.opts
//   )
//   const user3Provider = new anchor.AnchorProvider(
//     adminProvider.connection,
//     new anchor.Wallet(user3),
//     adminProvider.opts
//   )

//   const provider = user1Provider
//   anchor.setProvider(provider)

//   const program = anchor.workspace.StakingContract as Program<StakingContract>;

//   const [tokenVaultPda] = PublicKey.findProgramAddressSync(
//     [Buffer.from("token_vault")],
//     program.programId,
//   );

//   it("initialize", async () => {
//     const [userInfoPDA] = PublicKey.findProgramAddressSync(
//       [Buffer.from("user_info_maker"), mintToken.publicKey.toBuffer()],
//       program.programId
//     )

//     try {
//       const tx = await program.methods.initialize()
//         .accounts({
//           mintToken: mintToken.publicKey,
//         })
//         .rpc()
//     } catch (err) {

//     }
//   })

//   it("initizlie user history", async () => {
//     try {
//       const tx = await program.methods.initializeUserHistory()
//         .accounts({
//           mintToken: mintToken.publicKey,
//           user: provider.wallet.publicKey
//         })
//         .rpc()
//       console.log("tx =>", tx)
//     } catch (err) {
//       console.log("Err")
//     }
//   })

//   it("Deposite token in contract", async () => {
//     const amount = 108
//     const programStandard = TOKEN_PROGRAM_ID;
//     const MINT_ADDRESS = mintToken.publicKey
//     const USER_ADDRESS = provider.wallet.publicKey
//     const TOKEN_VAULT_ADDRESS = tokenVaultPda
//     const tx = await stake_token(
//       provider,
//       program,
//       MINT_ADDRESS,
//       USER_ADDRESS,
//       TOKEN_VAULT_ADDRESS,
//       amount,
//       programStandard
//     )

//     const [userInfoPDA] = PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("user_info_maker"),
//         mintToken.publicKey.toBuffer()
//       ],
//       program.programId
//     )
//     const accountData = await program.account.userInfoMaker.fetch(
//       userInfoPDA
//     )
//     console.log("Amount =>", accountData.amount.toNumber() / (10 ** 9))

//     const [userHistoryPDA] = PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("user_history"),
//         mintToken.publicKey.toBuffer(),
//         provider.wallet.publicKey.toBuffer()
//       ],
//       program.programId
//     )

//     const userHistoryData = await program.account.userHistory.fetch(
//       userHistoryPDA
//     )
//     console.log("History =>", await convertToBN(userHistoryData.stakingAmount))
//     console.log("History =>", await convertFromHextToInt(userHistoryData.stakingStart))
//     console.log("History =>", await convertFromHextToInt(userHistoryData.stakingEnd))
//   })

//   it("Claim token in PDA", async () => {
//     const amount = 10
//     const programStandard = TOKEN_PROGRAM_ID;
//     const MINT_ADDRESS = mintToken.publicKey
//     const USER_ADDRESS = provider.wallet.publicKey
//     const TOKEN_VAULT_ADDRESS = tokenVaultPda
//     const tx = await claim_token(
//       provider,
//       program,
//       MINT_ADDRESS,
//       USER_ADDRESS,
//       TOKEN_VAULT_ADDRESS,
//       amount,
//       programStandard
//     )

//     const [userInfoPDA] = PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("user_info_maker"),
//         mintToken.publicKey.toBuffer()
//       ],
//       program.programId
//     )
//     const accountData = await program.account.userInfoMaker.fetch(
//       userInfoPDA
//     )
//     console.log("Amount =>", accountData.amount.toNumber() / (10 ** 9))

//     const [userHistoryPDA] = PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("user_history"),
//         mintToken.publicKey.toBuffer(),
//         provider.wallet.publicKey.toBuffer()
//       ],
//       program.programId
//     )

//     const userHistoryData = await program.account.userHistory.fetch(
//       userHistoryPDA
//     )
//     console.log("History =>", await convertToBN(userHistoryData.stakingAmount))
//     console.log("History =>", await convertFromHextToInt(userHistoryData.stakingStart))
//     console.log("History =>", await convertFromHextToInt(userHistoryData.stakingEnd))
//   })

//   it("Withdraw token in PDA", async () => {
//     const index = 0
//     const programStandard = TOKEN_PROGRAM_ID;
//     const MINT_ADDRESS = mintToken.publicKey
//     const USER_ADDRESS = provider.wallet.publicKey
//     const TOKEN_VAULT_ADDRESS = tokenVaultPda
//     const tx = await withdraw_token(
//       provider,
//       program,
//       index,
//       MINT_ADDRESS,
//       USER_ADDRESS,
//       TOKEN_VAULT_ADDRESS,
//       programStandard
//     )

//     const [userInfoPDA] = PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("user_info_maker"),
//         mintToken.publicKey.toBuffer()
//       ],
//       program.programId
//     )
//     const accountData = await program.account.userInfoMaker.fetch(
//       userInfoPDA
//     )
//     console.log("Amount =>", accountData.amount.toNumber() / (10 ** 9))

//     const [userHistoryPDA] = PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("user_history"),
//         mintToken.publicKey.toBuffer(),
//         provider.wallet.publicKey.toBuffer()
//       ],
//       program.programId
//     )

//     const userHistoryData = await program.account.userHistory.fetch(
//       userHistoryPDA
//     )
//     console.log("History =>", await convertToBN(userHistoryData.stakingAmount))
//     console.log("History =>", await convertFromHextToInt(userHistoryData.stakingStart))
//     console.log("History =>", await convertFromHextToInt(userHistoryData.stakingEnd))
//   })
// })
