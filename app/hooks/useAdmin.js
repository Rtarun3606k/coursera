"use client";

import { useSession } from "next-auth/react";

export const useAdmin = () => {
  const { data: session, status } = useSession();

  return {
    isAdmin: session?.user?.isAdmin || false,
    isLoading: status === "loading",
    user: session?.user,
    role: session?.user?.role || "guest",
  };
};
