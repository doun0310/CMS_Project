import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseAnonKey.includes('your-anon-key');

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://supabase.com/dashboard/project/npumvyhwwijdreyhefqk',
  isSupabaseConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdW12eWh3d2lqZHJleWhlZnFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ3ODYyNjAsImV4cCI6MjEwMDM2MjI2MH0.pMu17I54_NR8aoL_RCdcsmbaeNfhfIzfAz_ZtsA9d2s'
);

/**
 * Helper to subscribe to real-time changes on a specific table.
 */
export const subscribeToTable = (
  tableName: string,
  onPayload: (payload: any) => void
) => {
  if (!isSupabaseConfigured) return () => {};

  const channel = supabase
    .channel(`public:${tableName}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: tableName },
      (payload) => {
        onPayload(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
