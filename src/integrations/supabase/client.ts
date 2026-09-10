// client.ts — MIGRATION COMPLETE
// This file previously contained the Supabase browser client.
// All database operations now go through the Hostinger MySQL API via
// src/integrations/mysql/client.ts
//
// This stub is kept to avoid import errors in any files that have not yet
// been updated. All active callers have been migrated.

// Re-export from MySQL client so any residual `supabase` usage
// fails at compile time with a clear error (no properties match).
export const supabase = {} as never;
