import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import { film } from '@/content/film';

const GAME_ACCESS_KEY = 'nebula_cascade_game_access';
const GAME_PASSWORD = import.meta.env.VITE_GAME_PASSWORD;

type Section = 'home' | 'trailer' | 'synopsis' | 'credits';

const Landing = () => {
  const navigate = useNavigate();
  const [gateOpen, setGateOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authorized, setAuthorized] = useState(false);
  const [section, setSection] = useState<Section>('home');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthorized(sessionStorage.getItem(GAME_ACCESS_KEY) === 'true');
    }
  }, []);

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

  const navItems: { id: Section; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'trailer', label: 'Trailer' },
    { id: 'synopsis', label: 'Synopsis' },
    { id: 'credits', label: 'Credits' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <SEO title={film.title} description={film.synopsis} path="/" />

      {/* Poster as the dominant background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/poster.png"
          alt={`${film.title} movie poster`}
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Cinematic dark vignette so text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-black/60" />
      </div>

      {/* Top navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={`text-[11px] uppercase tracking-[0.35em] transition ${
                section === item.id
                  ? 'text-red-400'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleOpenGate}
          className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white transition hover:border-white/40 hover:bg-white/10"
        >
          Access Admin
        </button>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex min-h-[calc(100vh-80px)] flex-col justify-center px-6 sm:px-10 lg:px-16">
        <div className="max-w-2xl space-y-6">
          {section === 'home' && (
            <>
              <p className="text-[11px] tracking-[0.35em] uppercase text-red-400/80">
                A film by enrique catalan
              </p>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-[-0.05em] text-white drop-shadow-2xl">
                {film.title}
              </h1>
              <p className="max-w-xl text-base sm:text-lg text-slate-200/90 leading-relaxed drop-shadow-lg">
                {film.tagline}
              </p>
              <p className="text-sm tracking-[0.2em] uppercase text-slate-400">
                Coming soon
              </p>
            </>
          )}

          {section === 'trailer' && (
            <div className="space-y-4">
              <p className="text-[11px] tracking-[0.35em] uppercase text-red-400/80">
                Trailer
              </p>
              <h2 className="text-4xl font-bold uppercase tracking-[-0.04em] text-white">
                Coming Soon
              </h2>
              <p className="max-w-xl text-base text-slate-300/90 leading-relaxed">
                The official trailer for {film.title} will be presented here.
                Check back shortly for the first look.
              </p>
            </div>
          )}

          {section === 'synopsis' && (
            <div className="space-y-4">
              <p className="text-[11px] tracking-[0.35em] uppercase text-red-400/80">
                Synopsis
              </p>
              <h2 className="text-4xl font-bold uppercase tracking-[-0.04em] text-white">
                {film.title}
              </h2>
              <p className="max-w-xl text-base text-slate-200/90 leading-relaxed">
                {film.synopsis}
              </p>
            </div>
          )}

          {section === 'credits' && (
            <div className="space-y-4">
              <p className="text-[11px] tracking-[0.35em] uppercase text-red-400/80">
                Credits
              </p>
              <h2 className="text-4xl font-bold uppercase tracking-[-0.04em] text-white">
                {film.title}
              </h2>
              <div className="space-y-2 text-sm text-slate-300">
                <p>{film.filmmaker}</p>
                <p>Contact: {film.contact.email || 'email@example.com'}</p>
                <p>Website: {film.contact.website || 'example.com'}</p>
                <p>{film.socials.twitter || 'twitter.com/placeholder'}</p>
                <p>{film.socials.instagram || 'instagram.com/placeholder'}</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 mt-auto px-6 pb-8 text-xs uppercase tracking-[0.35em] text-slate-500 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Nebula Cascade</span>
          <span>Designed for a minimal film presentation.</span>
        </div>
      </footer>

      {/* Private access gate — unchanged */}
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
    </div>
  );
};

export default Landing;
