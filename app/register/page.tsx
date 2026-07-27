"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle } from "lucide-react";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { COUNTRIES, SIGNUP_PURPOSES, REFERRAL_SOURCES } from "@/lib/constants/countries";

export default function RegisterPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    countryOfResidence: "",
    countryOfOrigin: "",
    signupPurpose: "",
    referralSource: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (pwd.length > 128) return "Password must be no more than 128 characters";
    return null;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError("Email and password are required");
      return;
    }

    if (!formData.countryOfResidence) {
      setError("Please select your country of residence");
      return;
    }

    if (!formData.signupPurpose) {
      setError("Please tell us why you're signing up");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the Terms & Privacy Policy to create an account");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email,
          password: formData.password,
          countryOfResidence: formData.countryOfResidence,
          countryOfOrigin: formData.countryOfOrigin || undefined,
          signupPurpose: formData.signupPurpose,
          referralSource: formData.referralSource || undefined,
          agreedToTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full h-[700px] rounded-lg border border-primary/20 bg-card/50 backdrop-blur animate-pulse" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-green-500/20 bg-card/50 backdrop-blur">
          <CardContent className="pt-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">Account Created!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Your account has been successfully created. Redirecting to login...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-primary/20 bg-card/50 backdrop-blur">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif font-bold">Join Fortress</CardTitle>
          <CardDescription>Create your investment command center account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <GoogleSignInButton
              variant="default"
              text="Sign up with Google"
              onError={(error) => setError(error)}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card/50 px-2 text-muted-foreground">Or</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <Input
                id="name"
                type="text"
                name="name"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
                showPasswordToggle
              />
              <PasswordStrengthMeter
                password={formData.password}
                showRequirements={true}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <Input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
                showPasswordToggle
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="countryOfResidence" className="text-sm font-medium">
                  Country of Residence
                </label>
                <Select
                  id="countryOfResidence"
                  name="countryOfResidence"
                  value={formData.countryOfResidence}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="countryOfOrigin" className="text-sm font-medium">
                  Country of Origin <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Select
                  id="countryOfOrigin"
                  name="countryOfOrigin"
                  value={formData.countryOfOrigin}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="signupPurpose" className="text-sm font-medium">
                Why are you signing up?
              </label>
              <Select
                id="signupPurpose"
                name="signupPurpose"
                value={formData.signupPurpose}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select...</option>
                {SIGNUP_PURPOSES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="referralSource" className="text-sm font-medium">
                How did you hear about us? <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <Select
                id="referralSource"
                name="referralSource"
                value={formData.referralSource}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select...</option>
                {REFERRAL_SOURCES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </Select>
            </div>

            <div className="border-t pt-4 flex items-start gap-2">
              <input
                id="agreedToTerms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                disabled={loading}
                className="mt-1 h-4 w-4 rounded border-gray-600 bg-background text-primary focus:ring-primary"
              />
              <label htmlFor="agreedToTerms" className="text-sm text-muted-foreground">
                I agree to the{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{" "}
                and Terms of Service, including Fortress collecting usage data and
                feedback to improve the platform.
              </label>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
