import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const createSupabaseAdminClient = (url: string, serviceRoleKey: string): SupabaseClient =>
  createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

export const createSupabaseClient = (url: string, anonKey: string): SupabaseClient =>
  createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
