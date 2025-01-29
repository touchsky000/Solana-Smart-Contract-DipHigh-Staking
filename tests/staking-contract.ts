import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StakingContract } from "../target/types/staking_contract";
import { Keypair, } from "@solana/web3.js"
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
describe("staking-contract", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider);

  const program = anchor.workspace.StakingContract as Program<StakingContract>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });

  it("Create Token", async () => {
    const mintToken = anchor.web3.Keypair.generate()

    const tokenAccount = anchor.utils.token.associatedAddress({ mint: mintToken.publicKey, owner: provider.publicKey })

    const decimal = 9
    const amount = new anchor.BN(10 ** 9)
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
});
