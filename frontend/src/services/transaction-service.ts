import { Connection, Transaction } from "@solana/web3.js";

// Deserialize a base64 transaction from API
export function deserializeTx(base64: string): Transaction {
  return Transaction.from(Buffer.from(base64, "base64"));
}

// Sign and send a transaction
export async function signAndSendTransaction(
  connection: Connection,
  transaction: Transaction,
  signTransaction: (tx: Transaction) => Promise<Transaction>
): Promise<string> {
  const signed = await signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });

  const confirmation = await connection.confirmTransaction(
    signature,
    "confirmed"
  );

  if (confirmation.value.err) {
    throw new Error(
      `Transaction failed: ${JSON.stringify(confirmation.value.err)}`
    );
  }

  return signature;
}
