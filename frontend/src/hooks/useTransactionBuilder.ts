"use client";

import { useCallback, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";

interface TransactionResult {
  signature: string;
  confirmed: boolean;
}

export function useTransactionBuilder() {
  const { connection } = useConnection();
  const { publicKey, signTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildAndSend = useCallback(
    async (
      apiEndpoint: string,
      body: Record<string, unknown>
    ): Promise<TransactionResult> => {
      if (!publicKey || !signTransaction) {
        throw new Error("Wallet not connected");
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Call API to build unsigned transaction
        const response = await fetch(apiEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, wallet: publicKey.toBase58() }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to build transaction");
        }

        const { transaction: txBase64 } = await response.json();

        // 2. Deserialize and sign
        const tx = Transaction.from(Buffer.from(txBase64, "base64"));
        const signedTx = await signTransaction(tx);

        // 3. Send raw transaction
        const signature = await connection.sendRawTransaction(
          signedTx.serialize(),
          { skipPreflight: false, preflightCommitment: "confirmed" }
        );

        // 4. Confirm
        const confirmation = await connection.confirmTransaction(
          signature,
          "confirmed"
        );

        if (confirmation.value.err) {
          throw new Error(
            `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
          );
        }

        return { signature, confirmed: true };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Transaction failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [publicKey, signTransaction, connection]
  );

  return { buildAndSend, loading, error, setError };
}
