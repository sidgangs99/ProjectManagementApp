import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const SignIn = () => {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && router.pathname !== "/home") {
      router.replace("/home");
    }
  }, [status, router]);

  if (status === "loading")
    return (
      <div className="flex h-screen items-center justify-center">
        Checking authentication...
      </div>
    );

  return (
    <div className="flex min-h-screen items-center justify-center">
      <button onClick={() => signIn()} className="btn-primary">
        Sign In
      </button>
    </div>
  );
};

export default SignIn;
