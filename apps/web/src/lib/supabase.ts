import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Client Supabase, ou null si le multijoueur n'est pas configuré (le solo fonctionne sans). */
export const supabase: SupabaseClient | null = url && key ? createClient(url, key, { auth: { flowType: 'pkce', persistSession: true, detectSessionInUrl: true } }) : null;

const AFTER_LOGIN = 'veillee:apres-connexion';

export function useSession(): { session: Session | null; loading: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!!supabase);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s) {
        try {
          const back = localStorage.getItem(AFTER_LOGIN);
          if (back) {
            localStorage.removeItem(AFTER_LOGIN);
            window.location.hash = back;
          }
        } catch {
          // rien
        }
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return { session, loading };
}

/** Envoie un lien magique de connexion ; la route actuelle est restaurée au retour. */
export async function sendMagicLink(email: string) {
  if (!supabase) throw new Error("Le multijoueur n'est pas configuré.");
  try {
    localStorage.setItem(AFTER_LOGIN, window.location.hash || '#/');
  } catch {
    // rien
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin + window.location.pathname },
  });
  if (error) throw new Error(error.message);
}

export async function signOut() {
  await supabase?.auth.signOut();
}
