/**
 * auth.ts — Shared auth helpers.
 * signInWithGoogle uses Lovable Cloud's managed Google OAuth.
 */
import { lovable } from '@/integrations/lovable';

export async function signInWithGoogle(): Promise<{ error?: string }> {
  const result = await lovable.auth.signInWithOAuth('google', {
    redirect_uri: window.location.origin,
  });
  if (result.error) {
    return { error: result.error instanceof Error ? result.error.message : String(result.error) };
  }
  // result.redirected === true → browser navigates away; nothing else to do.
  return {};
}
