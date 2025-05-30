"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import React from "react";

const LoginButton = () => {
  return (
    <div>
      <center>
        <Button
          onClick={() => signIn("google")}
          className="px-6 py-2 m-12 rounded-lg bg-primary text-primary-foreground hover:bg-accent transition-all duration-200 font-medium shadow-sm hover:shadow-md"
        >
          Sign In with Google
        </Button>
      </center>
    </div>
  );
};

export default LoginButton;
