import { Connection } from "@solana/web3.js";

let _connection: Connection | null = null;

function getRpcEndpoint(): string {
  return (
    process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
    `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY || ""}`
  );
}

// Solana connection via Helius RPC (lazy singleton)
export const connection = {
  get instance(): Connection {
    if (!_connection) {
      _connection = new Connection(getRpcEndpoint(), "confirmed");
    }
    return _connection;
  },
  // Proxy commonly used methods
  getLatestBlockhash: (...args: Parameters<Connection["getLatestBlockhash"]>) =>
    getConnection().getLatestBlockhash(...args),
  getAccountInfo: (...args: Parameters<Connection["getAccountInfo"]>) =>
    getConnection().getAccountInfo(...args),
  getMultipleAccountsInfo: (
    ...args: Parameters<Connection["getMultipleAccountsInfo"]>
  ) => getConnection().getMultipleAccountsInfo(...args),
  sendRawTransaction: (...args: Parameters<Connection["sendRawTransaction"]>) =>
    getConnection().sendRawTransaction(...args),
  confirmTransaction: (...args: Parameters<Connection["confirmTransaction"]>) =>
    getConnection().confirmTransaction(...args as [any, any]),
};

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(getRpcEndpoint(), "confirmed");
  }
  return _connection;
}

// Helius Enhanced API base URL
const HELIUS_API_BASE = "https://api.helius.xyz/v0";

function getApiKey(): string {
  return process.env.HELIUS_API_KEY || "";
}

// Parse a transaction using Helius Enhanced API
export async function parseTransaction(signature: string) {
  const response = await fetch(
    `${HELIUS_API_BASE}/transactions/?api-key=${getApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transactions: [signature] }),
    }
  );

  if (!response.ok) {
    throw new Error(`Helius API error: ${response.status}`);
  }

  const data = await response.json();
  return data[0];
}

// Register a webhook with Helius
export async function registerWebhook(
  webhookUrl: string,
  accountAddresses: string[]
) {
  const response = await fetch(
    `${HELIUS_API_BASE}/webhooks?api-key=${getApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        webhookURL: webhookUrl,
        transactionTypes: ["Any"],
        accountAddresses,
        webhookType: "enhanced",
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Webhook registration failed: ${response.status}`);
  }

  return response.json();
}
