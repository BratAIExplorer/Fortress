"use client";

import { useEffect, useState } from "react";

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  // Length
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // Character diversity
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return "weak";
  if (score <= 4) return "fair";
  if (score <= 5) return "good";
  return "strong";
}

export function PasswordStrengthMeter({
  password,
  showRequirements = true,
}: PasswordStrengthProps) {
  const [strength, setStrength] = useState<PasswordStrength>("weak");

  useEffect(() => {
    if (password) {
      setStrength(getPasswordStrength(password));
    }
  }, [password]);

  const strengthConfig = {
    weak: { label: "Weak", color: "bg-red-500", progress: 25 },
    fair: { label: "Fair", color: "bg-amber-500", progress: 50 },
    good: { label: "Good", color: "bg-blue-500", progress: 75 },
    strong: { label: "Strong", color: "bg-green-500", progress: 100 },
  };

  const config = strengthConfig[strength];

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          Password Strength
        </span>
        <span className={`text-xs font-semibold ${
          strength === 'weak' ? 'text-red-500' :
          strength === 'fair' ? 'text-amber-500' :
          strength === 'good' ? 'text-blue-500' :
          'text-green-500'
        }`}>
          {config.label}
        </span>
      </div>

      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all ${config.color}`}
          style={{ width: `${config.progress}%` }}
        />
      </div>

      {showRequirements && (
        <div className="text-xs text-muted-foreground space-y-1 pt-1">
          <div className="flex items-center gap-2">
            <span className={password.length >= 8 ? "text-green-500" : "text-muted-foreground"}>
              ✓
            </span>
            <span>At least 8 characters</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={/[A-Z]/.test(password) ? "text-green-500" : "text-muted-foreground"}>
              ✓
            </span>
            <span>One uppercase letter</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={/[0-9]/.test(password) ? "text-green-500" : "text-muted-foreground"}>
              ✓
            </span>
            <span>One number</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={/[^a-zA-Z0-9]/.test(password) ? "text-green-500" : "text-muted-foreground"}>
              ✓
            </span>
            <span>One special character</span>
          </div>
        </div>
      )}
    </div>
  );
}
