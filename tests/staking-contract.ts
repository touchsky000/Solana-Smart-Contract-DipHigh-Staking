import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StakingContract } from "../target/types/staking_contract";
import { Keypair, PublicKey } from "@solana/web3.js"
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAccount, createBurnInstruction } from "@solana/spl-token"
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
import { assert } from "chai"
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

  it("Is initialized!", async () => {
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
      console.log(error);
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

  // it("Transfer Token", async () => {
  //   const receiver = Keypair.generate()
  //   const signature = await provider.connection.requestAirdrop(receiver.publicKey, anchor.web3.LAMPORTS_PER_SOL);
  //   await provider.connection.confirmTransaction(signature)

  //   console.log("receiver address =>", receiver.publicKey.toBase58())
  //   const amount = new anchor.BN(1000 * 10 ** 9)
  //   const receiverAtaAccountKeyPair = Keypair.generate()
  //   await createAccount(
  //     provider.connection,
  //     receiver,
  //     mintToken.publicKey,
  //     receiver.publicKey,
  //     receiverAtaAccountKeyPair
  //   )

  //   const tx = await program.methods.transferSplToken(amount)
  //     .accounts({
  //       mintToken: mintToken.publicKey,
  //       fromAccount: tokenAccount,
  //       toAccount: receiverAtaAccountKeyPair.publicKey,
  //       signer: provider.wallet.publicKey,
  //       associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
  //     })
  //     .signers([])
  //     .rpc()
  //   console.log("transaction is ", tx)
  // })


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
  //   console.log("loading...")
  //   const [userInfoPDA] = PublicKey.findProgramAddressSync(
  //     [Buffer.from("userinfo")],
  //     program.programId
  //   )

  //   console.log("PDA", userInfoPDA)

  //   const inittx = await program.methods.initialize()
  //     .accounts({
  //       userInfo: userInfoPDA
  //     })
  //     .rpc();

  //   console.log("receiver userinfo acc was initialized!", inittx)
  //   const prevaccountData = await program.account.userInfo.fetch(
  //     userInfoPDA
  //   )

  //   assert.equal((prevaccountData.amount.toNumber()) / (10 ** decimal), 0)

    // await program.methods.stakeSplToken(amount2)
    //   .accounts({
    //     mintToken: mintToken.publicKey,
    //     fromAccount: tokenAccount,
    //     toAccount: receiverAtaAccountKeyPair.publicKey,
    //     signer: provider.wallet.publicKey,
    //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //     userInfo: userInfoPDA
    //   })
    //   .signers([])
    //   .rpc()

    // assert.equal(((await program.account.userInfo.fetch(
    //   userInfoPDA
    // )).amount.toNumber()) / (10 ** decimal), 2000)

    // await program.methods.stakeSplToken(amount1)
    //   .accounts({
    //     mintToken: mintToken.publicKey,
    //     fromAccount: tokenAccount,
    //     toAccount: receiverAtaAccountKeyPair.publicKey,
    //     signer: provider.wallet.publicKey,
    //     associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //     userInfo: userInfoPDA
    //   })
    //   .signers([])
    //   .rpc()

    // assert.equal(((await program.account.userInfo.fetch(
    //   userInfoPDA
    // )).amount.toNumber()) / (10 ** decimal), 3000)


  // })

});