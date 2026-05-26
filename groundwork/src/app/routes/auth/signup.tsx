import { useState } from "react";
import { Link } from "react-router";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleOAuthButton } from "@/components/auth/GoogleOAuthButton";

export function meta() {
  return [
    { title: "Create Account — Groundwork by Jalla" },
    {
      name: "description",
      content: "Create your Groundwork account and start managing your build.",
    },
  ];
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-brand-border-grey mb-4">
          <CheckCircle className="w-6 h-6 text-brand-near-black" />
        </div>
        <h2 className="text-xl font-bold text-brand-near-black mb-2">
          Check your email
        </h2>
        <p className="text-sm text-brand-mid-grey leading-relaxed">
          We sent a confirmation link to{" "}
          <span className="font-semibold text-brand-near-black">{email}</span>.
          <br />
          Click the link to activate your account.
        </p>
        <p className="mt-6 text-sm text-brand-mid-grey">
          Wrong email?{" "}
          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setEmail("");
              setPassword("");
            }}
            className="text-brand-near-black font-semibold hover:underline"
          >
            Go back
          </button>
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-brand-near-black mb-2">
        Create your account
      </h1>
      <p className="text-brand-mid-grey mb-8 text-sm">
        Start managing your construction project today.
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
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-brand-black text-white hover:bg-brand-near-black"
          disabled={loading}
        >
          {loading ? "Creating account…" : "Create Account"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 border-t border-brand-border-grey" />
        <span className="text-xs text-brand-mid-grey">or</span>
        <div className="flex-1 border-t border-brand-border-grey" />
      </div>

      <GoogleOAuthButton />

      <p className="mt-6 text-center text-sm text-brand-mid-grey">
        Already have an account?{" "}
        <Link
          to="/auth/login"
          className="text-brand-near-black font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-brand-muted-grey leading-relaxed">
        By creating an account you agree to our{" "}
        <Link to="/terms" className="underline hover:text-brand-near-black">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="underline hover:text-brand-near-black">
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}
