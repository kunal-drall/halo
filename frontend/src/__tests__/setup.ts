import "@testing-library/jest-dom/vitest";

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SOLANA_NETWORK = "devnet";
process.env.NEXT_PUBLIC_RPC_ENDPOINT = "https://api.devnet.solana.com";
process.env.NEXT_PUBLIC_PROGRAM_ID =
  "25yXdB1i6MN7MvRoR17Q5okn3pEktaMEH2QP4wJv3Bs5";
process.env.NEXT_PUBLIC_USDC_MINT =
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";
process.env.SESSION_SECRET = "test-session-secret-must-be-32-chars-long";
process.env.HELIUS_API_KEY = "test-helius-key";
process.env.HELIUS_WEBHOOK_SECRET = "test-webhook-secret";
process.env.UPSTASH_REDIS_REST_URL = "";
process.env.UPSTASH_REDIS_REST_TOKEN = "";
