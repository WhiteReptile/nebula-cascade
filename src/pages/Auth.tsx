import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signInWithGoogle } from '@/lib/auth';
import SEO from '@/components/SEO';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: 'Welcome back!', description: 'Signed in successfully.' });
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || email.split('@')[0] },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({ title: 'Check your email', description: 'We sent you a verification link.' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#050510' }}>
      <SEO
        title="Sign In — Nebula Cascade"
        description="Sign in or create an account to play Nebula Cascade and collect NFT cards on Base."
        path="/auth"
      />
      <div className="w-full max-w-sm mx-auto p-6">
        <h1
          className="text-2xl font-bold font-mono tracking-[0.3em] text-center mb-8"
          style={{ color: '#ffdd00', textShadow: '0 0 15px #ffdd00' }}
        >
          NEBULA CASCADE
        </h1>

        <div className="rounded-lg border border-yellow-500/20 bg-black/60 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-mono text-yellow-300 mb-4 text-center">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>

          <button
            type="button"
            onClick={async () => {
              const { error } = await signInWithGoogle();
              if (error) toast({ title: 'Google sign-in failed', description: error, variant: 'destructive' });
            }}
            className="w-full mb-4 font-mono uppercase tracking-[0.2em] text-sm py-2 rounded border border-yellow-500/40 bg-black/40 text-yellow-200 hover:bg-yellow-500/10 hover:border-yellow-400/70 transition-all flex items-center justify-center gap-2"
            style={{ textShadow: '0 0 8px rgba(255,221,0,0.4)' }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.8 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.9 36 44 30.5 44 24c0-1.3-.1-2.4-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 h-px bg-yellow-500/20" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-yellow-500/40">or</span>
            <div className="flex-1 h-px bg-yellow-500/20" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input
                placeholder="Display Name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="bg-black/40 border-white/10 text-white placeholder:text-white/30 font-mono"
              />
            )}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="bg-black/40 border-white/10 text-white placeholder:text-white/30 font-mono"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-black/40 border-white/10 text-white placeholder:text-white/30 font-mono"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-mono bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30"
              style={{ textShadow: '0 0 8px #ffdd00' }}
            >
              {loading ? '...' : isLogin ? 'SIGN IN' : 'SIGN UP'}
            </Button>
          </form>

          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-4 w-full font-mono text-sm border border-yellow-500/40 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 transition-colors rounded-md py-2"
            style={{ textShadow: '0 0 8px rgba(255,221,0,0.4)' }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-5 text-sm font-mono w-full text-center transition-colors"
          style={{ color: '#ffbb44', textShadow: '0 0 6px rgba(255,187,68,0.4)' }}
        >
          ← Back to game
        </button>
      </div>
    </div>
  );
};

export default Auth;
