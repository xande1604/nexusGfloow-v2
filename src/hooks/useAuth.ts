import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // On sign in, try to link user to employee
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            supabase.rpc('link_user_to_employee_on_login', {
              _user_id: session.user.id,
              _email: session.user.email || '',
            }).then(({ data, error }) => {
              if (error) console.error('Error linking employee:', error);
              else if (data?.linked) console.log('Employee linked:', data.employee_name);
            });
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string, accessKey?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name },
      },
    });

    if (error) {
      return { error, keyValidation: null };
    }

    // If access key provided and user created, validate it
    if (accessKey && data.user) {
      const keyResult = await validateAccessKey(accessKey, data.user.id);
      return { error: null, keyValidation: keyResult };
    }

    return { error: null, keyValidation: null };
  };

  const validateAccessKey = async (keyCode: string, userId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-access-key', {
        body: { keyCode, userId },
      });

      if (error) {
        console.error('Error validating key:', error);
        return { success: false, error: error.message };
      }

      if (data.error) {
        return { success: false, error: data.error };
      }

      return { success: true, role: data.role, message: data.message };
    } catch (err: any) {
      console.error('Exception validating key:', err);
      return { success: false, error: 'Erro ao validar chave de acesso' };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    validateAccessKey,
    isAuthenticated: !!session,
  };
};
