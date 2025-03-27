import { type Session, type User } from "@supabase/supabase-js";

export type AuthUser = User | null;
export type AuthSession = Session | null;

export interface AuthContextType {
  user: AuthUser;
  loading: boolean;
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
