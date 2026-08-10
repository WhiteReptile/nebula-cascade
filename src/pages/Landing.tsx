import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GalaxyBackground from '@/components/shared/GalaxyBackground';
import SEO from '@/components/SEO';
import { film } from '@/content/film';
import PosterModal from '@/components/PosterModal';

const videoSources = [
  { type: 'video/webm', src: film.trailerWebm },
  { type: 'video/mp4', src: film.trailerMp4 },
];

const GAME_ACCESS_KEY = 'nebula_cascade_game_access';
const GAME_PASSWORD = import.meta.env.VITE_GAME_PASSWORD;

const Landing = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [posterOpen, setPosterOpen] = useState(false);

  useEffect(() => {
    setShowInfo(false);
    if (typeof window !== 'undefined') {
      setAuthorized(sessionStorage.getItem(GAME_ACCESS_KEY) === 'true');
    }
  }, []);

  const handleVideoReady = () => {
    setIsPlaying(true);
  };

  const handleVideoBlocked = () => {
    setAutoplayBlocked(true);
  };

  const handleEnableSound = () => {
    setSoundEnabled(true);
    setIsPlaying(true);
  };

  const handleSkip = () => {
    setShowInfo(true);
    setIsPlaying(false);
  };

  const handleOpenGate = () => {
    setGateOpen(true);
    setError('');
  };

  const handleCloseGate = () => {
    setGateOpen(false);
    setPassword('');
    setError('');
  };

  const handleAuthorize = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!GAME_PASSWORD) {
      console.warn('VITE_GAME_PASSWORD is not set — game gate locked in development.');
      setError('Game access is not configured.');
      return;
    }

    if (!password.trim()) {
      setError('Enter the gate passphrase.');
      return;
    }

    if (password === GAME_PASSWORD) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(GAME_ACCESS_KEY, 'true');
      }
      navigate('/game');
      return;
    }

    setError('Incorrect passphrase.');
  };

  const infoClassName = useMemo(
    () =>
      `relative z-20 max-w-3xl mx-auto px-6 py-10 text-white ${
        showInfo ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      } transition-opacity duration-700`,
    [showInfo]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <SEO title={film.title} description={film.synopsis} path="/" />
      <GalaxyBackground zIndex={0} />
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative z-10 min-h-screen flex flex-col justify-center">
        <div className="absolute right-6 top-6 z-30">
          <button
            type="button"
            onClick={handleOpenGate}
            className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/10"
          >
            ACCESS ADMIN
          </button>
        </div>

        <div className="absolute inset-0">
          <video
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted={!soundEnabled}
            autoPlay
            controls={false}
            poster={film.poster}
            onCanPlay={handleVideoReady}
            onError={handleVideoBlocked}
            onEnded={() => setShowInfo(true)}
          >
            {videoSources.map((source) => (
              <source key={source.type} src={source.src} type={source.type} />
            ))}
            Your browser does not support embedded video.
          </video>
          <div className="absolute inset-0 bg-black/80" />
        </div>

        <div className="relative z-20 flex flex-col items-start gap-8 px-6 py-12 sm:px-10 lg:px-16">
          <div className="max-w-2xl space-y-6">
            <p className="text-[11px] tracking-[0.35em] uppercase text-red-400/80">A film by enrique catalan</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-[-0.05em] text-white">{film.title}</h1>
            <p className="max-w-xl text-base sm:text-lg text-slate-200/90 leading-relaxed">{film.tagline}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleEnableSound}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/10"
            >
              {soundEnabled ? 'Sound Enabled' : 'Enable Sound'}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-full border border-red-400/30 bg-red-500/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-red-300 transition hover:border-red-400/60 hover:bg-red-500/10"
            >
              Skip Trailer
            </button>
            <button
              type="button"
              onClick={() => setPosterOpen(true)}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/10"
            >
              View Poster
            </button>
          </div>

          {autoplayBlocked && (
            <p className="max-w-xl text-sm text-slate-400">
              Autoplay was blocked by your browser. Use the button above to start audio and continue.
            </p>
          )}
        </div>

        <div className={infoClassName}>
          <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.35em] text-red-400/80">Now presenting</p>
              <h2 className="text-4xl font-bold uppercase tracking-[-0.04em] text-white">{film.title}</h2>
              <p className="text-base leading-8 text-slate-200/90">{film.synopsis}</p>
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                <div className="space-y-2 text-sm text-slate-300">
                  <p>{film.filmmaker}</p>
                  <p>Contact: {film.contact.email || 'email@example.com'}</p>
                  <p>Website: {film.contact.website || 'example.com'}</p>
                </div>
                <div className="space-y-2 text-right text-sm text-slate-400">
                  <p>Follow:</p>
                  <p>{film.socials.twitter || 'twitter.com/placeholder'}</p>
                  <p>{film.socials.instagram || 'instagram.com/placeholder'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="relative z-20 mt-auto px-6 pb-8 text-xs uppercase tracking-[0.35em] text-slate-500 sm:px-10 lg:px-16">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Nebula Cascade</span>
            <span>Designed for a minimal film presentation.</span>
          </div>
        </footer>
      </div>

      {gateOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950/95 p-8 shadow-2xl shadow-black/70 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-red-400/80">Private access</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Game Gate</h2>
              </div>
              <button
                type="button"
                onClick={handleCloseGate}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:border-white/20 hover:bg-white/10"
              >
                Close
              </button>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleAuthorize}>
              <label className="block text-sm uppercase tracking-[0.3em] text-slate-400" htmlFor="game-password">
                Passphrase
              </label>
              <input
                id="game-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-cyan-400/30 bg-slate-900/95 px-4 py-3 text-cyan-100 placeholder-cyan-300 outline-none transition duration-300 ease-out focus:border-cyan-300 focus:bg-slate-800 focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Enrique Catalan"
                autoComplete="off"
              />
              {error && <p className="text-sm text-rose-300">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-full bg-white/10 px-4 py-3 text-sm uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
              >
                {authorized ? 'Continue to Game' : 'Unlock Game'}
              </button>
            </form>
          </div>
        </div>
      )}
      <PosterModal src={film.poster} title={film.title} open={posterOpen} onClose={() => setPosterOpen(false)} />
    </div>
  );
};

export default Landing;
