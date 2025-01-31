const {
    Connection,
    PublicKey,
    Transaction,
    ComputeBudgetProgram,
} = require('@solana/web3.js');
import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountIdempotentInstruction
} from "@solana/spl-token"

export const derivePDA = async (mint, wallet, programId) => {
    try {
        // The seeds for the PDA will be the mint address and wallet address.
        const seeds = [
            mint.toBuffer(),      // Mint address (SPL Token)
            wallet.toBuffer(),    // Wallet address
        ];
        // Derive the PDA using the seeds and the program ID
        const [pda, bump] = await PublicKey.findProgramAddress(seeds, programId);
        return pda;
    } catch (error) {
        console.error('Error deriving PDA:', error);
    }
}

export const createTransaction = () => {
    const transaction = new Transaction();
    transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({
            units: 200000
        })
    );
    return transaction;
}


export const stake_token = async (provider, program, MINT_ADDRESS, USER_ADDRESS, programStandard) => {
    const transaction = createTransaction();
    const tokenAccount = anchor.utils.token.associatedAddress({ mint: MINT_ADDRESS, owner: provider.publicKey })
    const associatedToken = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        provider.wallet.publicKey,
        false,
        programStandard
    );

    const senderAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            provider.wallet.publicKey,
            associatedToken,
            provider.wallet.publicKey,
            MINT_ADDRESS,
            programStandard
        );

    transaction.add(senderAtaInstruction);

    const recipientAssociatedToken = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        USER_ADDRESS,
        false,
        programStandard
    );

    const recipientAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            provider.wallet.publicKey,
            recipientAssociatedToken,
            USER_ADDRESS,
            MINT_ADDRESS,
            programStandard
        );

    transaction.add(recipientAtaInstruction);

    const mint = await provider.connection.getTokenSupply(MINT_ADDRESS);
    const decimals = mint.value.decimals;
    // Fix: Ensure proper BN calculation
    const multiplier = new BN(10).pow(new BN(decimals));
    // const sendAmount = new BN(SEND_AMOUNT).mul(multiplier);
    let send_amount = 1000 * 10 ** decimals;

    console.log("Decimal =>", decimals)

    transaction.add(
        await program.methods
            .stakeSplToken(new anchor.BN(send_amount))
            .accounts({
                mintToken: MINT_ADDRESS,
                fromAccount: tokenAccount,
                toAccount: recipientAssociatedToken,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
            })
            .instruction()
    );

    const tx = await provider.sendAndConfirm(transaction)
    return tx
}



export const transfer_token = async (provider, program, MINT_ADDRESS, USER_ADDRESS, programStandard) => {
    const transaction = createTransaction();
    const tokenAccount = anchor.utils.token.associatedAddress({ mint: MINT_ADDRESS, owner: provider.publicKey })
    const associatedToken = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        provider.wallet.publicKey,
        false,
        programStandard
    );

    const senderAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            provider.wallet.publicKey,
            associatedToken,
            provider.wallet.publicKey,
            MINT_ADDRESS,
            programStandard
        );

    transaction.add(senderAtaInstruction);

    const recipientAssociatedToken = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        USER_ADDRESS,
        false,
        programStandard
    );

    const recipientAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            provider.wallet.publicKey,
            recipientAssociatedToken,
            USER_ADDRESS,
            MINT_ADDRESS,
            programStandard
        );

    transaction.add(recipientAtaInstruction);

    const mint = await provider.connection.getTokenSupply(MINT_ADDRESS);
    const decimals = mint.value.decimals;
    // Fix: Ensure proper BN calculation
    const multiplier = new BN(10).pow(new BN(decimals));
    // const sendAmount = new BN(SEND_AMOUNT).mul(multiplier);
    let send_amount = 1000 * 10 ** decimals;

    console.log("Decimal =>", decimals)

    transaction.add(
        await program.methods
            .transferSplToken(new anchor.BN(send_amount))
            .accounts({
                mintToken: MINT_ADDRESS,
                fromAccount: tokenAccount,
                toAccount: recipientAssociatedToken,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
            })
            .instruction()
    );

    const tx = await provider.sendAndConfirm(transaction)
    return tx
}