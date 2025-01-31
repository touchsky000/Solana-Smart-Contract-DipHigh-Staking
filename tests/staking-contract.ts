import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { StakingContract } from "../target/types/staking_contract";
import { Keypair, PublicKey, Transaction, } from "@solana/web3.js"
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token"
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
import { assert } from "chai"
import { 
  derivePDA, 
  transfer_token,
  stake_token
} from "./function";

describe("staking-contract", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);
  const program = anchor.workspace.StakingContract as Program<StakingContract>;

  const user1 = Keypair.generate()
  const mintToken = anchor.web3.Keypair.generate()
  const tokenAccount = anchor.utils.token.associatedAddress({
    mint: mintToken.publicKey,
    owner: provider.wallet.publicKey
  })

  const [userInfoPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("user_info_maker")],
    program.programId
  )

  it("Is pda acc initialized!", async () => {
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
      console.log("already initialize");
    }
  });

  it("Create Token", async () => {
    const decimal = 9
    const amount = new anchor.BN("100000000000000000")
    const tx = await program.methods.createToken(decimal, amount)
      .accounts({
        mintToken: mintToken.publicKey,
        tokenAccount: tokenAccount,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .signers([mintToken])
      .rpc()
    console.log("Transaction is ", tx)
  })

  it("Transfer Token admin", async () => {
    const receiver = Keypair.generate()
    const tx = await transfer_token(
      provider,
      program,
      mintToken.publicKey,
      receiver.publicKey,
      TOKEN_PROGRAM_ID
    )
    console.log("transaction is ", tx)
  })


  // it("Stake Spl Token !", async () => {
  //   const decimal = 9

  //   const receiver = Keypair.generate()
  //   const signature = await provider.connection.requestAirdrop(receiver.publicKey, anchor.web3.LAMPORTS_PER_SOL);
  //   await provider.connection.confirmTransaction(signature)

  //   console.log("receiver address =>", receiver.publicKey.toBase58())
  //   const amount1 = new anchor.BN(1000 * 10 ** 9)
  //   const amount2 = new anchor.BN(2000 * 10 ** 9)
  //   const receiverAtaAccountKeyPair = Keypair.generate()
  //   await createAccount(
  //     provider.connection,
  //     receiver,
  //     mintToken.publicKey,
  //     receiver.publicKey,
  //     receiverAtaAccountKeyPair
  //   )

  //   const prevaccountData = await program.account.userInfoMaker.fetch(
  //     userInfoPDA
  //   )

  //   assert.equal((prevaccountData.amount.toNumber()) / (10 ** decimal), 0)

  //   await program.methods.stakeSplToken(amount2)
  //     .accounts({
  //       mintToken: mintToken.publicKey,
  //       fromAccount: tokenAccount,
  //       toAccount: receiverAtaAccountKeyPair.publicKey,
  //       signer: provider.wallet.publicKey,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       userInfoMaker: userInfoPDA
  //     })
  //     .signers([])
  //     .rpc()

  //   assert.equal(((await program.account.userInfoMaker.fetch(
  //     userInfoPDA
  //   )).amount.toNumber()) / (10 ** decimal), 2000)

  //   await program.methods.stakeSplToken(amount1)
  //     .accounts({
  //       mintToken: mintToken.publicKey,
  //       fromAccount: tokenAccount,
  //       toAccount: receiverAtaAccountKeyPair.publicKey,
  //       signer: provider.wallet.publicKey,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
  //       userInfoMaker: userInfoPDA
  //     })
  //     .signers([])
  //     .rpc()

  //   assert.equal(((await program.account.userInfoMaker.fetch(
  //     userInfoPDA
  //   )).amount.toNumber()) / (10 ** decimal), 3000)
  // })

  it("get pda account of contract", async () => {
    const pda = await derivePDA(mintToken.publicKey, provider.wallet.publicKey, program.programId)
    const decimal = 9
    const amount1 = new anchor.BN(1000 * 10 ** 9)
    const programStandard = TOKEN_PROGRAM_ID;
    const MINT_ADDRESS = mintToken.publicKey
    const USER_ADDRESS = program.programId

    // await program.methods.stakeSplToken(amount1)
    //   .accounts({
    //     mintToken: mintToken.publicKey,
    //     fromAccount: tokenAccount,
    //     toAccount: pda.publicKey,
    //     signer: provider.wallet.publicKey,
    //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //     userInfoMaker: userInfoPDA
    //   })
    //   .signers([])
    //   .rpc()
  })

});