import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type RoleRecord = {
  role: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadAuth = async () => {
      setIsLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(currentUser ?? null);
      if (!currentUser) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id);

      if (!mounted) return;
      setIsAdmin(roles?.some((record: RoleRecord) => record.role === 'admin') ?? false);
      setIsLoading(false);
    };

    loadAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadAuth();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isAuthenticated: Boolean(user),
    isAdmin,
    isLoading,
  };
}
