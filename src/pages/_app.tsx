"use client";

import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { type AppType } from "next/app";
import { Geist } from "next/font/google";

import "@/styles/globals.css";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import { useEffect } from "react";

const geist = Geist({ subsets: ["latin"] });

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log({ status });

    const allowedRoutes = ["/", "/auth/signin"];
    if (
      status === "unauthenticated" &&
      !allowedRoutes.includes(router.pathname)
    ) {
      router.replace("/auth/signin");
    }
  }, [status, router]);

  if (status === "loading") return <div>Loading...</div>;
  return <>{children}</>;
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <AuthGuard>
        <div className={geist.className}>
          <Component {...pageProps} />
        </div>
      </AuthGuard>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
