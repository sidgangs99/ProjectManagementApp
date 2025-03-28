import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const handleRedirect = async () => {
      if (requireAuth && !user) {
        await router.push(redirectTo);
      } else if (!requireAuth && user) {
        await router.push("/home");
      }
    };

    handleRedirect().catch((err) => console.error("Navigation error:", err));
  }, [user, loading, router, requireAuth, redirectTo]);

  if (loading)
    return (
      <div>
        <Loader2 />
      </div>
    );

  if (requireAuth && !user) return null;

  return <>{children}</>;
}
