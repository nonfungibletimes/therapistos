import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Practitioner } from '../types/db';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [practitioner, setPractitioner] = useState<Practitioner | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    supabase.from('practitioners').select('*').eq('user_id', session.user.id).single().then(({ data }) => setPractitioner(data));
  }, [session?.user]);

  const signIn = (email: string) => supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
  const signOut = () => supabase.auth.signOut();

  return { session, user: session?.user ?? null, practitioner, loading, signIn, signOut };
}
