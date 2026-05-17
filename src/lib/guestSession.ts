/**
 * Guest session helpers.
 *
 * Guest players have no account: they pick a nickname, play, and their
 * score is stored against a device-bound id for 24h, then auto-purged.
 *
 * - device_id: random UUID stored once in localStorage. Survives across
 *   guest sessions on the same browser/profile.
 * - nickname: chosen on every "Play as Guest". Kept in sessionStorage
 *   so a refresh keeps it, but a new tab/visit asks again.
 */
const DEVICE_KEY = 'nebula:guest:device_id';
const NICK_KEY = 'nebula:guest:nickname';

export const NICKNAME_REGEX = /^[A-Za-z0-9_-]{3,16}$/;
export const GUEST_MIN_SCORE = 2000;

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr';
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = (crypto.randomUUID?.() ?? `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getGuestNickname(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(NICK_KEY);
}

export function setGuestNickname(nickname: string): void {
  sessionStorage.setItem(NICK_KEY, nickname);
}

export function clearGuestNickname(): void {
  sessionStorage.removeItem(NICK_KEY);
}

export function validateNickname(value: string): { ok: boolean; error?: string } {
  const v = value.trim();
  if (!v) return { ok: false, error: 'Nickname required' };
  if (v.length < 3) return { ok: false, error: 'At least 3 characters' };
  if (v.length > 16) return { ok: false, error: 'At most 16 characters' };
  if (!NICKNAME_REGEX.test(v)) return { ok: false, error: 'Letters, numbers, _ or - only' };
  return { ok: true };
}

export async function submitGuestScore(payload: {
  score: number;
  level_reached?: number;
  survival_seconds?: number;
}): Promise<{ ok: boolean; reason?: string }> {
  const nickname = getGuestNickname();
  if (!nickname) return { ok: false, reason: 'no_nickname' };
  if (payload.score < GUEST_MIN_SCORE) return { ok: false, reason: 'below_threshold' };

  const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/submit-guest-score`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname,
        device_id: getDeviceId(),
        score: Math.floor(payload.score),
        level_reached: payload.level_reached ?? 1,
        survival_seconds: payload.survival_seconds ?? 0,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return { ok: false, reason: j.error ?? `http_${res.status}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'network_error' };
  }
}
