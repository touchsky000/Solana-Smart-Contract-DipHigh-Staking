import * as anchor from "@coral-xyz/anchor";
import {
    PublicKey,
    Transaction,
    ComputeBudgetProgram,
    Keypair
} from "@solana/web3.js";
import {
    getAccount,
    getMint
} from "@solana/spl-token"
import {
    BN,
    Program,
} from "@coral-xyz/anchor";

import {
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountIdempotentInstruction,
    createBurnInstruction,
    getAssociatedTokenAddress
} from "@solana/spl-token"

import { StakingContract } from "../target/types/staking_contract";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";

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
    provider: anchor.AnchorProvider,
    MINT_ADDRESS: PublicKey,
    signer: Keypair,  // Explicitly expect a Keypair as the signer
    decimal: number,
    amount: BN
) => {
    // Ensure provider is correctly set

    // Derive the associated token account
    const tokenAccount = await getAssociatedTokenAddress(
        MINT_ADDRESS,
        provider.wallet.publicKey // Correct way to get provider's public key
    );

    console.log("Using provider:", provider.wallet.publicKey.toBase58());
    console.log("Derived Token Account:", tokenAccount.toBase58());

    // Send transaction to create token
    const tx = await program.methods.createToken(decimal, amount)
        .accounts({
            mintToken: MINT_ADDRESS,
            tokenAccount: tokenAccount,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        })
        .signers([signer])  // Ensure signer is correct
        .rpc();

    console.log("Token Creation Transaction:", tx);
    return tx;
};


export const create_Token_with_provider = async (
    program: Program<StakingContract>,
    provider: anchor.AnchorProvider,
    MINT_ADDRESS: PublicKey,
    signer: Keypair,  // Explicitly expect a Keypair as the signer
    decimal: number,
    amount: BN
) => {
    // Ensure provider is correctly set

    // Derive the associated token account
    const transaction = createTransaction();
    const tokenAccount = await getAssociatedTokenAddress(
        MINT_ADDRESS,
        provider.wallet.publicKey // Correct way to get provider's public key
    );

    console.log("Using provider:", provider.wallet.publicKey.toBase58());
    console.log("Derived Token Account:", tokenAccount.toBase58());

    transaction.add(
        await program.methods
            .createToken(decimal, amount)
            .accounts({
                mintToken: MINT_ADDRESS,
                tokenAccount: tokenAccount,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
            })
            .signers([signer])
            .instruction()
    );

    const tx = await provider.sendAndConfirm(transaction)
    return tx
};

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

export const transfer_token_user_to_user = async (
    provider: any,
    program: Program<StakingContract>,
    MINT_ADDRESS: PublicKey,
    FROM_ADDRESS: PublicKey,
    TO_ADDRESS: PublicKey,
    amount: number,
    programStandard: PublicKey,
) => {
    const transaction = createTransaction();
    const tokenAccount = anchor.utils.token.associatedAddress({ mint: MINT_ADDRESS, owner: FROM_ADDRESS })
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
            FROM_ADDRESS,
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

    console.log("provider =>", provider.publicKey)
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

export const getTokenBalance = async (connection, walletAddress, mintAddress) => {
    const ata = await getAssociatedTokenAddress(mintAddress, walletAddress);
    console.log("Associated Token Account:", ata.toBase58());
    const tokenAccount = await getAccount(connection, ata);
    const balance = Number(tokenAccount.amount);
    const decimal = await getTokenDecimal(connection, mintAddress)
    return balance / (10 ** decimal);
}

export const getTokenDecimal = async (connection, mintAddress) => {
    const mintAccount = await getMint(connection, mintAddress);
    return Number(mintAccount.decimals);
}