import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export function useSupabaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setUser(data?.user ?? null);
    setError(error?.message ?? null);
    setLoading(false);
    return { user: data?.user, error };
  };

  const signUp = async (email, password) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setUser(data?.user ?? null);
    setError(error?.message ?? null);
    setLoading(false);
    return { user: data?.user, error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  return { user, loading, error, signIn, signUp, signOut };
}
