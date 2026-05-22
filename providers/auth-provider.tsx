"use client";

import React, { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { usePathname } from "next/navigation";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { checkAuth, logout, isChecking } = useAuthStore();
  const pathname = usePathname();

  useEffect(() => {
    // Perform initial authentication check to resume session
    checkAuth();

    // Central listener to force logout if any Axios interceptor encounters a 401
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth-unauthorized", handleUnauthorized);
    };
  }, [checkAuth, logout]);

  // Show a premium glassmorphic loading screen during initial session verification
  if (isChecking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090a0f] font-sans">
        <div className="relative flex flex-col items-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-800 border-t-indigo-500"></div>
          <div className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#090a0f]"></div>
          <p className="mt-6 text-sm font-medium tracking-wide text-slate-400 animate-pulse">
            Verifying secure session...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
