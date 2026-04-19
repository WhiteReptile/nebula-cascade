/**
 * sfx.ts — Tiny WebAudio helper for menu UI sound effects.
 * Synthesized on the fly, zero assets, autoplay-policy safe (lazy init on first call).
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

function isMuted(): boolean {
  try {
    return localStorage.getItem('sfxMuted') === '1';
  } catch {
    return false;
  }
}

function blip(freq: number, durationMs: number, type: OscillatorType, peakGain = 0.15) {
  if (isMuted()) return;
  const ac = getCtx();
  if (!ac) return;

  const now = ac.currentTime;
  const dur = durationMs / 1000;

  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  // tiny pitch drop for character
  osc.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.7, 80), now + dur);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + dur + 0.02);
}

/** Short crisp blip when moving the menu cursor. */
export function playTick() {
  blip(660, 80, 'triangle', 0.12);
}

/** Punchier confirmation blip when selecting an item. */
export function playSelect() {
  blip(440, 140, 'sine', 0.2);
}

export function setSfxMuted(muted: boolean) {
  try {
    localStorage.setItem('sfxMuted', muted ? '1' : '0');
  } catch {}
}
