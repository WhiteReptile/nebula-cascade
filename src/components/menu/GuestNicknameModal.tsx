import { useEffect, useRef, useState } from 'react';
import { validateNickname, setGuestNickname, GUEST_MIN_SCORE } from '@/lib/guestSession';

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
      </div>
    </div>
  );
};

export default GuestNicknameModal;
