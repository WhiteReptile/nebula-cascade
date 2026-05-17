import { useEffect, useRef, useState } from 'react';
import { validateNickname, setGuestNickname, GUEST_MIN_SCORE } from '@/lib/guestSession';
import { signInWithGoogle } from '@/lib/auth';

interface Props {
  open: boolean;
  onConfirm: (nickname: string) => void;
  onCancel: () => void;
}

const GuestNicknameModal = ({ open, onConfirm, onCancel }: Props) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setValue('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    const result = validateNickname(value);
    if (!result.ok) {
      setError(result.error ?? 'Invalid nickname');
      return;
    }
    const clean = value.trim();
    setGuestNickname(clean);
    onConfirm(clean);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(5,5,16,0.85)', backdropFilter: 'blur(6px)' }}
      onKeyDown={(e) => { if (e.key === 'Escape') onCancel(); }}
    >
      <div
        className="relative w-[min(420px,92vw)] rounded-lg border p-6 font-mono"
        style={{
          borderColor: 'rgba(255,0,200,0.4)',
          background: 'linear-gradient(180deg, rgba(20,5,30,0.95), rgba(8,2,18,0.95))',
          boxShadow: '0 0 30px rgba(255,0,200,0.25), inset 0 0 20px rgba(255,0,200,0.08)',
        }}
      >
        <div className="absolute top-2 right-3 text-[10px] tracking-[0.3em] text-pink-400/60">GUEST MODE</div>

        <h2
          className="text-xl font-bold uppercase tracking-[0.25em] text-pink-300 mb-1"
          style={{ textShadow: '0 0 14px rgba(255,80,200,0.6)' }}
        >
          Choose Nickname
        </h2>
        <p className="text-[11px] text-white/50 leading-snug mb-4">
          Play without an account. Your score is stored for <span className="text-pink-300">24 hours</span> and
          appears on the <span className="text-pink-300">GUESTS</span> board only if it's at least{' '}
          <span className="text-pink-300">{GUEST_MIN_SCORE.toLocaleString()}</span>. Create an account anytime
          to keep your progress.
        </p>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          maxLength={16}
          placeholder="3–16 chars · A-Z 0-9 _ -"
          className="w-full px-3 py-2 rounded bg-black/50 border border-pink-500/30 text-pink-100 placeholder:text-pink-200/20 outline-none focus:border-pink-400/70 focus:shadow-[0_0_12px_rgba(255,80,200,0.3)] transition-all text-sm tracking-widest uppercase"
        />
        {error && <div className="mt-2 text-[11px] text-red-400">{error}</div>}

        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 rounded text-xs uppercase tracking-[0.2em] text-white/50 border border-white/10 hover:border-white/30 hover:text-white/80 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="flex-[2] px-3 py-2 rounded text-xs uppercase tracking-[0.2em] text-black font-bold transition-all"
            style={{
              background: 'linear-gradient(90deg, #ff3df2, #ff66aa)',
              boxShadow: '0 0 18px rgba(255,80,200,0.55)',
            }}
          >
            Play as Guest →
          </button>
        </div>

        <button
          type="button"
          onClick={async () => { await signInWithGoogle(); }}
          className="mt-4 w-full text-[11px] uppercase tracking-[0.2em] text-cyan-300/70 hover:text-cyan-200 transition-colors flex items-center justify-center gap-2"
        >
          <svg width="11" height="11" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.9 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"/>
          </svg>
          Sign in with Google instead
        </button>
      </div>
    </div>
  );
};

export default GuestNicknameModal;
