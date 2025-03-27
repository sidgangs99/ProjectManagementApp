import { supabase } from "@/utils/supabase/client";
import { useRouter } from "next/router";
import { createContext, useContext, useEffect, useState } from "react";
import { type AuthContextType, type AuthUser } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN") {
        router.push("/home");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const value: AuthContextType = {
    user,
    loading,
    signUp: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          return { user: null, error };
        }

        return { user: data.user, error: null };
      } catch (error) {
        return {
          user: null,
          error: error instanceof Error ? error : new Error("Sign up failed"),
        };
      }
    },
    signIn: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          return { user: null, error };
        }

        return { user: data.user, error: null };
      } catch (error) {
        return {
          user: null,
          error: error instanceof Error ? error : new Error("Sign in failed"),
        };
      }
    },
    signOut: async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        router.push("/auth/signin");
      } catch (error) {
        console.error("Error signing out:", error);
      }
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
