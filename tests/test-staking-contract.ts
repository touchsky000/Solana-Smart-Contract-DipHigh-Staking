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
  getTokenBalance
} from "./token_control";

describe("test staking-contract", () => {
  const user1 = Keypair.generate()
  const user2 = Keypair.generate()

  console.log("user1 =>", user1.publicKey.toBase58())
  console.log("user2 =>", user2.publicKey.toBase58())

  const adminProvider = anchor.AnchorProvider.env()
  // anchor.setProvider(provider);

  const user1Provider = new anchor.AnchorProvider(
    adminProvider.connection, // You can use the same connection
    new anchor.Wallet(user1),
    adminProvider.opts
  );

  anchor.setProvider(user1Provider)

  const user2Provider = new anchor.AnchorProvider(
    adminProvider.connection,
    new anchor.Wallet(user2),
    adminProvider.opts
  )

  // anchor.setProvider(user1Provider)

  before(async () => {
    const sign1 = await user1Provider.connection.requestAirdrop(user1.publicKey, LAMPORTS_PER_SOL)
    const sign2 = await user2Provider.connection.requestAirdrop(user2.publicKey, LAMPORTS_PER_SOL)

    await adminProvider.connection.confirmTransaction(sign1)
    await adminProvider.connection.confirmTransaction(sign2)
    
    console.log("user1 airdrop =>", sign1)
    console.log("user2 airdrop =>", sign2)

    const balanceUser1 = await adminProvider.connection.getBalance(user1.publicKey)
    const balanceUser2 = await adminProvider.connection.getBalance(user2.publicKey)

    console.log("user1 balance => ", balanceUser1)
    console.log("user2 balance => ", balanceUser2)
  })

  const program = anchor.workspace.StakingContract as Program<StakingContract>;
  const mintToken = anchor.web3.Keypair.generate()


  it("get pda", async() => {
    const pda = await derivePDA(
      mintToken.publicKey,
      user1Provider.wallet.publicKey,
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

  it("Create Token", async () => {
    const decimal = 9
    const amount = new anchor.BN("100000000000000000")

    const provider = user1Provider
    const tx = await create_Token(
      program,
      provider,
      mintToken.publicKey,
      mintToken,
      decimal,
      amount,
    )
    console.log("tx =>", tx)
  })

  it("Transfer Token admin", async () => {
    const amount = 1000
    const provider = user1Provider
    const programStandard = TOKEN_PROGRAM_ID;
    const MINT_ADDRESS = mintToken.publicKey
    const TO_ADDRESS = user2.publicKey
    const FROM_ADDRESS = provider.wallet.publicKey

    const tx = await transfer_token(
      provider,
      program,
      MINT_ADDRESS,
      FROM_ADDRESS,
      TO_ADDRESS,
      amount,
      programStandard
    )

    console.log(`token ${MINT_ADDRESS} transfer ${amount} to user1: ${user1.publicKey}`)

    const balance = await getTokenBalance(
      provider.connection,
      user2.publicKey,
      mintToken.publicKey,
    )
    console.log("user balance =>", balance)
  })


  // it("Transfer Token from user to user", async () => {

  //   anchor.setProvider(user1Provider)

  //   const amount = 1000
  //   const programStandard = TOKEN_PROGRAM_ID;
  //   const MINT_ADDRESS = mintToken.publicKey
  //   const FROM_ADDRESS = user1.publicKey
  //   const TO_ADDRESS = user2.publicKey
  //   const programId = program.programId;

  //   const tx = await transfer_token_user_to_user(
  //     user1Provider,
  //     program,
  //     MINT_ADDRESS,
  //     FROM_ADDRESS,
  //     TO_ADDRESS,
  //     amount,
  //     programStandard,
  //     provider.wallet
  //   )
  //   console.log("Tx =>", tx)
  // })
});