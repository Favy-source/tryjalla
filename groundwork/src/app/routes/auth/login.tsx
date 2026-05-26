import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleOAuthButton } from "@/components/auth/GoogleOAuthButton";

export function meta() {
  return [
    { title: "Sign In — Groundwork by Jalla" },
    { name: "description", content: "Sign in to your Groundwork account." },
  ];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : error.message,
      );
      setLoading(false);
      return;
    }

    navigate(from, { replace: true });
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-brand-near-black mb-2">
        Sign in to your account
      </h1>
      <p className="text-brand-mid-grey mb-8 text-sm">
        Welcome back. Enter your details below.
      </p>

      {error && (
        <div
          role="alert"
          className="mb-6 p-3 border border-brand-border-grey rounded-lg text-sm text-brand-near-black bg-brand-light-grey"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-mid-grey hover:text-brand-near-black transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <div className="text-right">
            <Link
              to="/auth/reset-password"
              className="text-xs text-brand-near-black underline underline-offset-2 hover:text-brand-mid-grey transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-black text-white hover:bg-brand-near-black"
          disabled={loading}
        >
          {loading ? "Signing in…" : "Continue"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 border-t border-brand-border-grey" />
        <span className="text-xs text-brand-mid-grey">or</span>
        <div className="flex-1 border-t border-brand-border-grey" />
      </div>

      <GoogleOAuthButton />

      <p className="mt-6 text-center text-sm text-brand-mid-grey">
        Don't have an account?{" "}
        <Link
          to="/auth/signup"
          className="text-brand-near-black font-semibold hover:underline"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
