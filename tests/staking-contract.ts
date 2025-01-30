import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StakingContract } from "../target/types/staking_contract";
import { Keypair, } from "@solana/web3.js"
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, createAccount } from "@solana/spl-token"
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
describe("staking-contract", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);
  const program = anchor.workspace.StakingContract as Program<StakingContract>;
  
  const mintToken = anchor.web3.Keypair.generate()
  const tokenAccount = anchor.utils.token.associatedAddress({ 
    mint: mintToken.publicKey, 
    owner: provider.publicKey 
  }) 

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Create Token", async () => {
    const decimal = 9
    const amount = new anchor.BN("100000000000000000")
    const tx = await program.methods.createToken( decimal, amount)
    .accounts({
      mintToken: mintToken.publicKey,
      tokenAccount: tokenAccount,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .signers([mintToken])
    .rpc()
    console.log("Transaction is ", tx)
  })

  it("Transfer Token", async () => {
    const receiver = Keypair.generate()
    const signature = await provider.connection.requestAirdrop(receiver.publicKey, anchor.web3.LAMPORTS_PER_SOL);
    await provider.connection.confirmTransaction(signature)

    console.log("receiver address =>", receiver.publicKey.toBase58())
    const amount = new anchor.BN( 1000 * 10**9 )
    const receiverAtaAccountKeyPair = Keypair.generate()
    await createAccount(
      provider.connection, 
      receiver,
      mintToken.publicKey,
      receiver.publicKey,
      receiverAtaAccountKeyPair
    )
    
    const tx = await program.methods.transferToken(amount)
    .accounts({
      mintToken: mintToken.publicKey,
      fromAccount: tokenAccount,
      toAccount: receiverAtaAccountKeyPair.publicKey,
      signer: provider.wallet.publicKey,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
    })
    .signers([])
    .rpc()
    console.log("transaction is ", tx)
  })
});
