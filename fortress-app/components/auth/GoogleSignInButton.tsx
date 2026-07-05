"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GoogleSignInButtonProps {
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  text?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function GoogleSignInButton({
  variant = "outline",
  size = "default",
  text = "Continue with Google",
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { redirectTo: "/admin" });
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Sign in failed");
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      variant={variant}
      size={size}
      className="w-full"
    >
      {isLoading ? "Signing in..." : text}
    </Button>
  );
}
