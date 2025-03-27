import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = "/auth/signin",
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (requireAuth && !user) {
      router.push(redirectTo);
    }

    if (!requireAuth && user) {
      router.push("/home");
    }
  }, [user, loading, router, requireAuth, redirectTo]);

  if (loading) return <div>Loading...</div>;

  if (requireAuth && !user) return null;

  return <>{children}</>;
}
