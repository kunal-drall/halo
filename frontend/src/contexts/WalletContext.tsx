"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { signInWithWallet, signOut, getSession } from "@/lib/auth";
import { useCircleStore } from "@/stores/circleStore";
import { useTrustStore } from "@/stores/trustStore";

import "@solana/wallet-adapter-react-ui/styles.css";

// --- Auth Context ---
interface AuthState {
  user: Record<string, unknown> | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authError: string | null;
  handleDisconnect: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  isAuthenticating: false,
  authError: null,
  handleDisconnect: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// --- AuthBridge (inner component, child of WalletProvider) ---
function AuthBridge({ children }: { children: React.ReactNode }) {
  const { publicKey, connected, signMessage, disconnect } = useWallet();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const prevConnectedRef = useRef(false);
  const authAttemptedRef = useRef<string | null>(null);

  const clearCircleCache = useCircleStore((s) => s.clearCache);
  const clearTrustCache = useTrustStore((s) => s.clearCache);

  // Full disconnect: signOut + clear stores + wallet disconnect
  const handleDisconnect = useCallback(async () => {
    try {
      await signOut();
    } catch (e) {
      console.warn("signOut error (non-critical):", e);
    }
    clearCircleCache();
    clearTrustCache();
    setUser(null);
    setAuthError(null);
    authAttemptedRef.current = null;
    disconnect();
  }, [disconnect, clearCircleCache, clearTrustCache]);

  // On connect: check existing session, or create new one
  useEffect(() => {
    const walletAddress = publicKey?.toBase58() || null;

    // Detect fresh connection
    if (connected && publicKey && signMessage && !prevConnectedRef.current) {
      prevConnectedRef.current = true;

      // Skip if we already authed this wallet (StrictMode guard)
      if (authAttemptedRef.current === walletAddress) return;
      authAttemptedRef.current = walletAddress;

      (async () => {
        setIsAuthenticating(true);
        setAuthError(null);
        try {
          // Check for existing valid session (handles autoConnect/refresh)
          const existingUser = await getSession();
          if (existingUser) {
            setUser(existingUser);
            setIsAuthenticating(false);
            return;
          }

          // No session — sign in (prompts message signature)
          const newUser = await signInWithWallet(publicKey, signMessage);
          setUser(newUser);
        } catch (e) {
          const msg =
            e instanceof Error ? e.message : "Authentication failed";
          console.error("Auth error:", msg);
          setAuthError(msg);
        } finally {
          setIsAuthenticating(false);
        }
      })();
    }

    // Detect disconnect
    if (!connected && prevConnectedRef.current) {
      prevConnectedRef.current = false;
      signOut().catch(() => {});
      clearCircleCache();
      clearTrustCache();
      setUser(null);
      authAttemptedRef.current = null;
    }
  }, [connected, publicKey, signMessage, clearCircleCache, clearTrustCache]);

  const authState = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAuthenticating,
      authError,
      handleDisconnect,
    }),
    [user, isAuthenticating, authError, handleDisconnect]
  );

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}

// --- Main Provider ---
export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const endpoint = useMemo(
    () =>
      process.env.NEXT_PUBLIC_RPC_ENDPOINT || "https://api.devnet.solana.com",
    []
  );

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthBridge>{children}</AuthBridge>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
