import { supabase, isSupabaseConfigured } from './supabase';

export type AuthError = { message: string; code?: string };

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Create a new user account with email + password.
 * Also upserts a profile row so the profiles table is always in sync.
 */
export async function signUp({ email, password, name }: SignUpData): Promise<{ error: AuthError | null }> {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase가 설정되지 않았습니다.' } };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  });

  if (error) return { error: { message: error.message, code: error.code } };

  // Upsert profile so it's immediately queryable even before email confirmation
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      name,
      role: 'Developer',
    }, { onConflict: 'id' });
  }

  return { error: null };
}

/**
 * Sign in with email + password.
 */
export async function signIn({ email, password }: SignInData): Promise<{ error: AuthError | null }> {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase가 설정되지 않았습니다.' } };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: { message: error.message, code: error.code } };
  return { error: null };
}

/**
 * Sign in via Google OAuth — redirects and returns to the app automatically.
 */
export async function signInWithGoogle(): Promise<{ error: AuthError | null }> {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase가 설정되지 않았습니다.' } };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) return { error: { message: error.message } };
  return { error: null };
}

/**
 * Sign in via GitHub OAuth — redirects and returns to the app automatically.
 */
export async function signInWithGithub(): Promise<{ error: AuthError | null }> {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase가 설정되지 않았습니다.' } };

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) return { error: { message: error.message } };
  return { error: null };
}

/**
 * Fetch the list of OAuth identities linked to the current user.
 * Returns an array of provider names (e.g. ['github', 'google']).
 */
export async function getIdentities(): Promise<{ identities: { provider: string; identity_id: string }[]; error: AuthError | null }> {
  if (!isSupabaseConfigured) return { identities: [], error: null };

  const { data, error } = await supabase.auth.getUserIdentities();
  if (error) return { identities: [], error: { message: error.message } };
  return {
    identities: (data.identities ?? []).map((id) => ({
      provider: id.provider,
      identity_id: id.identity_id,
    })),
    error: null,
  };
}

/**
 * Link an additional OAuth provider to the currently signed-in user.
 * e.g. a Google-signed-in user can link their GitHub account.
 */
export async function linkIdentity(provider: 'github' | 'google'): Promise<{ error: AuthError | null }> {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase가 설정되지 않았습니다.' } };

  const { error } = await supabase.auth.linkIdentity({
    provider,
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) return { error: { message: error.message } };
  return { error: null };
}

/**
 * Unlink an OAuth provider from the currently signed-in user.
 * At least one identity must remain — Supabase will reject if it's the only one.
 */
export async function unlinkIdentity(identityId: string): Promise<{ error: AuthError | null }> {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase가 설정되지 않았습니다.' } };

  const { data: userData } = await supabase.auth.getUserIdentities();
  const identity = (userData?.identities ?? []).find((id) => id.identity_id === identityId);
  if (!identity) return { error: { message: '연결된 계정을 찾을 수 없습니다.' } };

  const { error } = await supabase.auth.unlinkIdentity(identity);
  if (error) return { error: { message: error.message } };
  return { error: null };
}

/**
 * Send password-reset email.
 */
export async function sendPasswordReset(email: string): Promise<{ error: AuthError | null }> {
  if (!isSupabaseConfigured) return { error: { message: 'Supabase가 설정되지 않았습니다.' } };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) return { error: { message: error.message } };
  return { error: null };
}

/**
 * Sign out current user.
 */
export async function signOut(): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.auth.signOut();
}

/**
 * Update the auth user's display name.
 */
export async function updateUserName(name: string): Promise<{ error: AuthError | null }> {
  if (!isSupabaseConfigured) return { error: null };

  const { error } = await supabase.auth.updateUser({ data: { name } });
  if (error) return { error: { message: error.message } };

  // Also keep the profiles table in sync
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('profiles').update({ name }).eq('id', user.id);
  }
  return { error: null };
}
