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
  stake_token,
  create_Token,
} from "./token_control";

describe("staking-contract", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);
  const program = anchor.workspace.StakingContract as Program<StakingContract>;
  const mintToken = anchor.web3.Keypair.generate()

  it("get pda", async() => {
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

  it("Create Token", async () => {
    const decimal = 9
    const amount = new anchor.BN("100000000000000000")
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
    const programStandard = TOKEN_PROGRAM_ID;
    const MINT_ADDRESS = mintToken.publicKey
    const TO_ADDRESS = program.programId
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

    console.log("Tx =>", tx)
  })

  it("stake spl token", async () => {
    const amount = 1000
    const programStandard = TOKEN_PROGRAM_ID;
    const MINT_ADDRESS = mintToken.publicKey
    const TO_ADDRESS = program.programId
    const FROM_ADDRESS = provider.wallet.publicKey
    
    const tx = await stake_token(
      provider,
      program,
      MINT_ADDRESS,
      FROM_ADDRESS,
      TO_ADDRESS,
      amount,
      programStandard
    )

    console.log("Tx =>", tx)
  })

});