import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client. NEVER import this from a Client Component.
// Bypasses Row Level Security — only ever call from Server Actions / Route Handlers
// after verifying the caller's role with requireAdmin() from lib/auth.ts.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
