"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";

const UnauthorizedPage = () => {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <svg
            className="mx-auto h-16 w-16 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-destructive mb-4">
          Access Denied
        </h1>

        <p className="text-muted-foreground mb-2">
          You don't have permission to access this page.
        </p>

        {session && (
          <p className="text-sm text-muted-foreground mb-6">
            Signed in as: {session.user.email}
          </p>
        )}

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/">Return Home</Link>
          </Button>

          {!session && (
            <Button variant="outline" asChild className="w-full">
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
