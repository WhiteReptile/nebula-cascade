import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
            className="mt-4 text-[11px] text-white/40 font-mono w-full text-center hover:text-white/60 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>

        <button
          onClick={() => navigate('/')}
          className="mt-4 text-[10px] text-white/30 font-mono w-full text-center hover:text-white/50 transition-colors"
        >
          ← Back to game
        </button>
      </div>
    </div>
  );
};

export default Auth;
