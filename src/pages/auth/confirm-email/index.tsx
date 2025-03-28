import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ConfirmEmail() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is not logged in, redirect to sign in
    if (!user) {
      void router.push("/auth/signin");
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Confirm your email
          </h1>
          <p className="mt-4 text-gray-600">
            We have sent a confirmation link to{" "}
            <span className="font-medium">{user?.email}</span>. Please check
            your inbox and click the link to verify your email address.
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Did not receive the email?{" "}
            <button className="font-medium text-indigo-600 hover:text-indigo-500">
              Resend confirmation
            </button>
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Do not forget to check your spam folder!
          </p>
        </div>
      </div>
    </div>
  );
}
