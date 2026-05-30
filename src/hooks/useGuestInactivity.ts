import { useEffect, useRef } from 'react';
import { clearGuestSession, getGuestSession } from '@/lib/guestSession';

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000;

export function useGuestInactivity(onTimeout: () => void, enabled: boolean) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const guest = getGuestSession();
    if (!guest) return;

    const resetTimer = () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        clearGuestSession();
        onTimeout();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events: Array<keyof WindowEventMap> = ['mousemove', 'keydown', 'touchstart', 'mousedown'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer();
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [enabled, onTimeout]);
}
