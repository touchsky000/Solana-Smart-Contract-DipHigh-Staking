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
  create_Token_with_provider
} from "./token_control";

describe("test staking-contract", async () => {
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

  // anchor.setProvider(adminProvider)
  anchor.setProvider(user1Provider)
  
  const program = anchor.workspace.StakingContract as Program<StakingContract>;
  const mintToken = Keypair.fromSecretKey(Uint8Array.from(require('./mntrKJfjURt4LFq7VF6RxkzprQwSbRvp9aN3WAM4JNf.json')));



  it("Airdrop SOL to test users", async () => {

    const airdropAmount = 10000 * LAMPORTS_PER_SOL
    const sign1 = await user1Provider.connection.requestAirdrop(user1.publicKey, airdropAmount)
    const sign2 = await user2Provider.connection.requestAirdrop(user2.publicKey, airdropAmount)
    const sign3 = await user3Provider.connection.requestAirdrop(user3.publicKey, airdropAmount)

    await adminProvider.connection.confirmTransaction(sign1)
    await adminProvider.connection.confirmTransaction(sign2)
    await adminProvider.connection.confirmTransaction(sign3)
    
    const balanceUser1 = await adminProvider.connection.getBalance(user1.publicKey)
    const balanceUser2 = await adminProvider.connection.getBalance(user2.publicKey)
    const balanceUser3 = await adminProvider.connection.getBalance(user3.publicKey)

    console.log("user1 balance => ", balanceUser1)
    console.log("user2 balance => ", balanceUser2)
    console.log("user2 balance => ", balanceUser3)
  });

  // const mintToken = Keypair.generate()

  it("get pda", async () => {
    const provider = adminProvider
    const pda = await derivePDA(
      mintToken.publicKey,
      provider.wallet.publicKey,
      program.programId
    )
    console.log('pda =>', pda)
  })

  it("Is pda acc initialized!", async () => {
    const [userInfoPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("user_info_maker")],
      program.programId
    )
    try {
      const txSig = await program.methods
        .initialize()
        .accounts({
          userInfoMaker: userInfoPDA,
        })
        .rpc();
      const accountData = await program.account.userInfoMaker.fetch(userInfoPDA);
      console.log(`Transaction Signature: ${txSig}`);
      console.log(`amount: ${accountData.amount}`);
    } catch (error) {
      // If PDA Account already created, then we expect an error
      console.log("already initialized")
    }
  });

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
  //   console.log("tx =>", tx)
  // })

  // it("Transfer Token from admin to user1", async () => {
  //   const amount = 100000
  //   const provider = adminProvider
  //   const programStandard = TOKEN_PROGRAM_ID;
  //   const MINT_ADDRESS = mintToken.publicKey
  //   const FROM_ADDRESS = provider.wallet.publicKey
  //   const TO_ADDRESS = user1.publicKey

  //   const tx = await transfer_token(
  //     provider,
  //     program,
  //     MINT_ADDRESS,
  //     FROM_ADDRESS,
  //     TO_ADDRESS,
  //     amount,
  //     programStandard
  //   )

  //   console.log(`token ${MINT_ADDRESS} transfer ${amount} to user1: ${TO_ADDRESS}`)

  //   const balance = await getTokenBalance(
  //     provider.connection,
  //     TO_ADDRESS,
  //     mintToken.publicKey,
  //   )
  //   console.log("user balance =>", balance)
  // })

  // it("Transfer Token from admin to user2", async () => {
  //   const amount = 100000
  //   const provider = adminProvider
  //   const programStandard = TOKEN_PROGRAM_ID;
  //   const MINT_ADDRESS = mintToken.publicKey
  //   const FROM_ADDRESS = provider.wallet.publicKey
  //   const TO_ADDRESS = user2.publicKey

  //   const tx = await transfer_token(
  //     provider,
  //     program,
  //     MINT_ADDRESS,
  //     FROM_ADDRESS,
  //     TO_ADDRESS,
  //     amount,
  //     programStandard
  //   )

  //   console.log(`token ${MINT_ADDRESS} transfer ${amount} to user2: ${TO_ADDRESS}`)

  //   const balance = await getTokenBalance(
  //     provider.connection,
  //     TO_ADDRESS,
  //     mintToken.publicKey,
  //   )
  //   console.log("user balance =>", balance)
  // })

  // it("Transfer Token from admin to user3", async () => {
  //   const amount = 100000
  //   const provider = adminProvider
  //   const programStandard = TOKEN_PROGRAM_ID;
  //   const MINT_ADDRESS = mintToken.publicKey
  //   const FROM_ADDRESS = provider.wallet.publicKey
  //   const TO_ADDRESS = user3.publicKey

  //   const tx = await transfer_token(
  //     provider,
  //     program,
  //     MINT_ADDRESS,
  //     FROM_ADDRESS,
  //     TO_ADDRESS,
  //     amount,
  //     programStandard
  //   )

  //   console.log(`token ${MINT_ADDRESS} transfer ${amount} to user2: ${TO_ADDRESS}`)

  //   const balance = await getTokenBalance(
  //     provider.connection,
  //     TO_ADDRESS,
  //     mintToken.publicKey,
  //   )
  //   console.log("user balance =>", balance)
  // })


  // it("Transfer Token from user1 to user2", async () => {

  //   const provider = user1Provider

  //   const amount = 10
  //   const programStandard = TOKEN_PROGRAM_ID;
  //   const MINT_ADDRESS = mintToken.publicKey
  //   const FROM_ADDRESS = provider.wallet.publicKey
  //   const TO_ADDRESS = user2.publicKey
  //   const tx = await transfer_token_user_to_user(
  //     provider,
  //     program,
  //     MINT_ADDRESS,
  //     FROM_ADDRESS,
  //     TO_ADDRESS,
  //     amount,
  //     programStandard
  //   )
  //   console.log("Tx =>", tx)

  // })
});