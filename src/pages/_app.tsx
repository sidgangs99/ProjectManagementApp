"use client";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { Geist } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import "@/styles/globals.css";
import { api } from "@/utils/api";

const geist = Geist({ subsets: ["latin"] });

// const AuthGuard = ({ children }: { children: React.ReactNode }) => {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     console.log({ status });

//     const allowedRoutes = ["/", "/auth/signin"];
//     if (
//       status === "unauthenticated" &&
//       !allowedRoutes.includes(router.pathname)
//     ) {
//       router.replace("/auth/signin");
//     }
//   }, [status, router]);

//   if (status === "loading") return <div>Loading...</div>;
//   return <>{children}</>;
// };

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <AuthProvider>
        <div className={geist.className}>
          <Component {...pageProps} />
          <Toaster />
        </div>
      </AuthProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
