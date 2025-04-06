import { type Session } from "@supabase/supabase-js";
import type { User } from "next-auth";

export type AuthUser = User | null;
export type AuthSession = Session | null;

export interface AuthContextType {
  user: AuthUser;
  loading: boolean;
  accessToken: string;
  setUserName: (name: string) => void;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{
    user: AuthUser;
    error: Error | null;
  }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{
    user: AuthUser;
    error: Error | null;
  }>;
  signOut: () => Promise<void>;
}
