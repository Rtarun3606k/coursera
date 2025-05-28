"use client";

import React from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const SignIn = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="outline" disabled>
        Loading...
      </Button>
    );
  }

  return (
    <div>
      {session ? (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {session.user?.image && (
              <Image
                src={session.user.image}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div className="hidden md:block">
              <span className="text-sm text-muted-foreground">
                Welcome, {session.user?.name}
              </span>
              {session.user?.isAdmin && (
                <div className="text-xs text-primary font-medium">Admin</div>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => signOut()}
            className="px-6 py-2"
          >
            Sign Out
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => signIn("google")}
          className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          Sign In with Google
        </Button>
      )}
    </div>
  );
};

export default SignIn;
