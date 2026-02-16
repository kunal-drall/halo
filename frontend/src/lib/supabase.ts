import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;
let _serviceClient: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
}

// Client-side Supabase client (uses anon key with RLS)
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      getSupabaseUrl(),
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
    );
  }
  return _supabase;
}

// Alias for backwards compatibility
export const supabase = {
  get auth() {
    return getSupabase().auth;
  },
  from(table: string) {
    return getSupabase().from(table);
  },
};

// Server-side Supabase client (bypasses RLS for webhook syncing)
export function getServiceClient(): SupabaseClient {
  if (!_serviceClient) {
    _serviceClient = createClient(
      getSupabaseUrl(),
      process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder"
    );
  }
  return _serviceClient;
}
