"use client";

import { supabase } from "@/utils/supabase/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { type AuthContextType, type AuthUser } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");

  const setUserName = (name: string) => {
    setUser({ ...user, name });
  };

  useEffect(() => {
    const getSession = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }
        console.log({ user });

        setUser(session?.user ?? null);
        setAccessToken(session?.access_token ?? "");
        return accessToken;
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setLoading(false);
      }
    };

    void getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? "");

      if (event === "SIGNED_IN") {
        router.push("/dashboard");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const { data } = await axios.get("/api/profile", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!data) throw new Error("Failed to fetch user");
        setUserName(data?.name);
      } catch (error) {}
    };

    if (user?.email && accessToken) {
      void fetchUserDetails();
    }
  }, [accessToken]);

  const value: AuthContextType = {
    user,
    accessToken,
    loading,
    setUserName,
    signUp: async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          return { user: null, error };
        }

        console.log({ data });
        // Ensure we use the auth user's ID from Supabase
        if (data.user) {
          try {
            await axios.post("/api/users", {
              id: data.user.id, // Explicitly use auth ID
              email: data.user.email,
              email_confirmed: false,
              created_at: new Date().toISOString(),
            });
          } catch (dbError) {
            console.error("Error creating user record:", dbError);
            // Consider rolling back auth creation if DB fails
            await supabase.auth.signOut();
            return {
              user: null,
              error: new Error("Failed to create user profile"),
            };
          }
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
        setUser(null);
        setAccessToken("");
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
