import * as anchor from "@coral-xyz/anchor";

import {
    PublicKey,
    Transaction,
    ComputeBudgetProgram,
} from "@solana/web3.js";

import {
    BN,
    Program,
} from "@coral-xyz/anchor";

import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountIdempotentInstruction
} from "@solana/spl-token"

import { StakingContract } from "../target/types/staking_contract";

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

export const create_Token = async (
    program: Program<StakingContract>,
    provider: any,
    MINT_ADDRESS: PublicKey,
    signer: any,
    decimal: number,
    amount: BN
) => {
    const tokenAccount = anchor.utils.token.associatedAddress({ mint: MINT_ADDRESS, owner: provider.publicKey })
    const tx = await program.methods.createToken(decimal, amount)
        .accounts({
            mintToken: MINT_ADDRESS,
            tokenAccount: tokenAccount,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .signers([signer])
        .rpc()
    return tx
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


export const transfer_token = async (
    provider: any,
    program: Program<StakingContract>,
    MINT_ADDRESS: PublicKey,
    FROM_ADDRESS: PublicKey,
    TO_ADDRESS: PublicKey,
    amount: number,
    programStandard: PublicKey
) => {
    const transaction = createTransaction();
    const tokenAccount = anchor.utils.token.associatedAddress({ mint: MINT_ADDRESS, owner: provider.publicKey })
    const associatedToken = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        FROM_ADDRESS,
        false,
        programStandard
    );

    const senderAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            FROM_ADDRESS,
            associatedToken,
            FROM_ADDRESS,
            MINT_ADDRESS,
            programStandard
        );

    transaction.add(senderAtaInstruction);

    const recipientAssociatedToken = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        TO_ADDRESS,
        false,
        programStandard
    );

    const recipientAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            provider.wallet.publicKey,
            recipientAssociatedToken,
            TO_ADDRESS,
            MINT_ADDRESS,
            programStandard
        );

    transaction.add(recipientAtaInstruction);

    const mint = await provider.connection.getTokenSupply(MINT_ADDRESS);
    const decimals = mint.value.decimals;
    // Fix: Ensure proper BN calculation
    const multiplier = new BN(10).pow(new BN(decimals));
    // const sendAmount = new BN(SEND_AMOUNT).mul(multiplier);
    let send_amount = amount * 10 ** decimals;

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


export const stake_token = async (
    provider: any,
    program: Program<StakingContract>,
    MINT_ADDRESS: PublicKey,
    FROM_ADDRESS: PublicKey,
    TO_ADDRESS: PublicKey,
    amount: number,
    programStandard: PublicKey
) => {
    const transaction = createTransaction();
    const tokenAccount = anchor.utils.token.associatedAddress({ mint: MINT_ADDRESS, owner: provider.publicKey })
    const associatedToken = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        FROM_ADDRESS,
        false,
        programStandard
    );

    const senderAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            FROM_ADDRESS,
            associatedToken,
            FROM_ADDRESS,
            MINT_ADDRESS,
            programStandard
        );

    transaction.add(senderAtaInstruction);

    const recipientAssociatedToken = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        TO_ADDRESS,
        false,
        programStandard
    );

    const recipientAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            provider.wallet.publicKey,
            recipientAssociatedToken,
            TO_ADDRESS,
            MINT_ADDRESS,
            programStandard
        );

    transaction.add(recipientAtaInstruction);

    const mint = await provider.connection.getTokenSupply(MINT_ADDRESS);
    const decimals = mint.value.decimals;
    // Fix: Ensure proper BN calculation
    const multiplier = new BN(10).pow(new BN(decimals));
    // const sendAmount = new BN(SEND_AMOUNT).mul(multiplier);
    let send_amount = amount * 10 ** decimals;

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