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
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction
} from "@solana/spl-token"

import { StakingContract } from "../target/types/staking_contract";
import { token } from "@coral-xyz/anchor/dist/cjs/utils";

export const convertFromHextToInt = async (array) => {
    let result = array
    for (let i = 0; i < array.length; i++) {
        result[i] = result[i].toNumber()
    }
    return result
}

export const convertToBN = async (array) => {
    let result = array
    for (let i = 0; i < array.length; i++) {
        result[i] = result[i].toNumber() / (10 ** 9)
    }
    return result
}


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

    const senderAta = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        FROM_ADDRESS,
        false,
    );

    const senderAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            FROM_ADDRESS,
            senderAta,
            FROM_ADDRESS,
            MINT_ADDRESS,
        );

    transaction.add(senderAtaInstruction);

    const receiverAta = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        TO_ADDRESS,
        false,
    );

    const recipientAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            provider.wallet.publicKey,
            receiverAta,
            TO_ADDRESS,
            MINT_ADDRESS,
        );

    transaction.add(recipientAtaInstruction);

    const mint = await provider.connection.getTokenSupply(MINT_ADDRESS);
    const decimals = mint.value.decimals;
    let send_amount = amount * 10 ** decimals;

    transaction.add(
        await program.methods
            .tokenTransfer(new anchor.BN(send_amount))
            .accounts({
                mintToken: MINT_ADDRESS,
                fromAccount: senderAta,
                toAccount: receiverAta,
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
    const senderAta = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        FROM_ADDRESS,
        false,
        programStandard
    );

    const senderAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            FROM_ADDRESS,
            senderAta,
            FROM_ADDRESS,
            MINT_ADDRESS,
            programStandard
        );

    transaction.add(senderAtaInstruction);

    const receiverAta = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        TO_ADDRESS,
        false,
        programStandard
    );

    const recipientAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            FROM_ADDRESS,
            receiverAta,
            TO_ADDRESS,
            MINT_ADDRESS,
            programStandard
        );

    transaction.add(recipientAtaInstruction);

    const mint = await provider.connection.getTokenSupply(MINT_ADDRESS);
    const decimals = mint.value.decimals;
    let send_amount = amount * 10 ** decimals;

    transaction.add(
        await program.methods
            .tokenTransfer(new anchor.BN(send_amount))
            .accounts({
                mintToken: MINT_ADDRESS,
                fromAccount: senderAta,
                toAccount: receiverAta,
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
    USER_ADDRESS: PublicKey,
    TOKEN_VAULT_ADDRESS: PublicKey,
    amount: number,
    period: number,
    apy: number,
) => {
    const transaction = createTransaction();

    const userAta = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        USER_ADDRESS,
        true,
    );

    const usererAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            USER_ADDRESS,
            userAta,
            USER_ADDRESS,
            MINT_ADDRESS,
        );

    transaction.add(usererAtaInstruction);

    const tokenVaultAta = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        TOKEN_VAULT_ADDRESS,
        true,
    );

    const tokenVaultAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            USER_ADDRESS,
            tokenVaultAta,
            TOKEN_VAULT_ADDRESS,
            MINT_ADDRESS,
        );

    transaction.add(tokenVaultAtaInstruction);

    const mint = await provider.connection.getTokenSupply(MINT_ADDRESS);
    const decimals = mint.value.decimals;
    let user_amount = new anchor.BN(amount * 10 ** decimals);
    let user_period = new anchor.BN(period)
    let user_apy = new anchor.BN(apy)

    transaction.add(
        await program.methods
            .depositeToken(user_amount, user_period, user_apy)
            .accounts({
                userAta: userAta,
                tokenVaultAta: tokenVaultAta,
                mintToken: MINT_ADDRESS
            })
            .instruction()
    );

    const tx = await provider.sendAndConfirm(transaction)
    return tx
}

export const withdraw_token = async (
    provider: any,
    program: Program<StakingContract>,
    index: number,
    MINT_ADDRESS: PublicKey,
    USER_ADDRESS: PublicKey,
    TOKEN_VAULT_ADDRESS: PublicKey,
    programStandard: PublicKey
) => {

    const transaction = createTransaction();

    const userAta = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        USER_ADDRESS,
        true,
        programStandard
    );

    const usererAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            USER_ADDRESS,
            userAta,
            USER_ADDRESS,
            MINT_ADDRESS,
        );

    transaction.add(usererAtaInstruction);

    const tokenVaultAta = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        TOKEN_VAULT_ADDRESS,
        true,
    );

    const tokenVaultAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            USER_ADDRESS,
            tokenVaultAta,
            TOKEN_VAULT_ADDRESS,
            MINT_ADDRESS,
        );

    transaction.add(tokenVaultAtaInstruction);

    const claimSign = await program.methods
        .withdrawToken(new anchor.BN(index))
        .accounts({
            userAta: userAta,
            tokenVaultAta: tokenVaultAta,
            mintToken: MINT_ADDRESS
        })
        .instruction()

    transaction.add(claimSign);

    const tx = await provider.sendAndConfirm(transaction)
    return tx
}

export const redeposite_token = async (
    provider: any,
    program: Program<StakingContract>,
    index: number,
    MINT_ADDRESS: PublicKey,
    USER_ADDRESS: PublicKey,
    TOKEN_VAULT_ADDRESS: PublicKey,
    programStandard: PublicKey
) => {

    const transaction = createTransaction();

    const userAta = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        USER_ADDRESS,
        true,
        programStandard
    );

    const usererAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            USER_ADDRESS,
            userAta,
            USER_ADDRESS,
            MINT_ADDRESS,
        );

    transaction.add(usererAtaInstruction);

    const tokenVaultAta = getAssociatedTokenAddressSync(
        MINT_ADDRESS,
        TOKEN_VAULT_ADDRESS,
        true,
    );

    const tokenVaultAtaInstruction =
        createAssociatedTokenAccountIdempotentInstruction(
            USER_ADDRESS,
            tokenVaultAta,
            TOKEN_VAULT_ADDRESS,
            MINT_ADDRESS,
        );

    transaction.add(tokenVaultAtaInstruction);

    const claimSign = await program.methods
        .redepositeToken(new anchor.BN(index))
        .accounts({
            userAta: userAta,
            tokenVaultAta: tokenVaultAta,
            mintToken: MINT_ADDRESS
        })
        .instruction()

    transaction.add(claimSign);

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

export const advanceTime = async (provider, seconds) => {
    const connection = provider.connection;
    const latestBlockTime = await connection.getBlockTime('finalized'); // Get current block time
    const futureTimestamp = latestBlockTime + seconds; // Set the time in the future
    // Simulate advancing time by "fast forwarding"
    await provider.connection.setTime(futureTimestamp); // You'd need this to manipulate the time
}