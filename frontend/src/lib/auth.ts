import { PublicKey } from "@solana/web3.js";

// Sign In With Solana (SIWS)
// The wallet signs a message to prove ownership, then we create/retrieve the user
export async function signInWithWallet(
  publicKey: PublicKey,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>
): Promise<Record<string, unknown> | null> {
  const address = publicKey.toBase58();
  const timestamp = Date.now();
  const message = `Sign in to Halo Protocol\nWallet: ${address}\nTimestamp: ${timestamp}`;
  const encodedMessage = new TextEncoder().encode(message);

  const signature = await signMessage(encodedMessage);

  // Send to backend for verification and session creation
  const response = await fetch("/api/auth/connect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet_address: address,
      message,
      signature: Buffer.from(signature).toString("base64"),
      timestamp,
    }),
  });

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  const data = await response.json();
  return data.user;
}

export async function signOut(): Promise<void> {
  // Clear backend session cookie (critical)
  await fetch("/api/auth/disconnect", { method: "POST" });

  // Clear Supabase auth session (optional, may fail without Supabase)
  try {
    const { supabase } = await import("./supabase");
    await supabase.auth.signOut();
  } catch {
    // Supabase unavailable — cookie is already cleared
  }
}

export async function getSession(): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch("/api/auth/session");
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}
