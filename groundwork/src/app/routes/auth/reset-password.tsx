import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function meta() {
  return [{ title: "Reset Password — Groundwork by Jalla" }];
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const step = searchParams.get("step") ?? "request";

  // ── Request reset link ──────────────────────────────────────────────
  const [email, setEmail] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  async function handleRequestReset(e: React.FormEvent) {
    e.preventDefault();
    setRequestLoading(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    // Always show success — never reveal whether the email exists
    setRequestSent(true);
    setRequestLoading(false);
  }

  // ── Set new password ────────────────────────────────────────────────
  const [newPassword, setNewPassword] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setUpdateError(null);
    setUpdateLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setUpdateError(error.message);
    } else {
      setUpdateSuccess(true);
    }
    setUpdateLoading(false);
  }

  // ── Render: new password step ───────────────────────────────────────
  if (step === "new-password") {
    if (updateSuccess) {
      return (
        <div>
          <h2 className="text-xl font-bold text-brand-near-black mb-2">
            Password updated
          </h2>
          <p className="text-sm text-brand-mid-grey mb-6">
            Your password has been changed successfully.
          </p>
          <Link
            to="/auth/login"
            className="text-sm font-semibold text-brand-near-black underline underline-offset-2"
          >
            Sign in with new password →
          </Link>
        </div>
      );
    }

    return (
      <>
        <h1 className="text-3xl font-bold text-brand-near-black mb-2">
          Set new password
        </h1>
        <p className="text-brand-mid-grey mb-8 text-sm">
          Choose a strong password — minimum 8 characters.
        </p>

        {updateError && (
          <div
            role="alert"
            className="mb-6 p-3 border border-brand-border-grey rounded-lg text-sm text-brand-near-black bg-brand-light-grey"
          >
            {updateError}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Min. 8 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              autoFocus
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-brand-black text-white hover:bg-brand-near-black"
            disabled={updateLoading}
          >
            {updateLoading ? "Updating…" : "Update password"}
          </Button>
        </form>
      </>
    );
  }

  // ── Render: request reset link (default step) ───────────────────────
  if (requestSent) {
    return (
      <div>
        <h2 className="text-xl font-bold text-brand-near-black mb-2">
          Check your email
        </h2>
        <p className="text-sm text-brand-mid-grey leading-relaxed">
          If that email is registered, you'll receive a password reset link
          shortly. Check your spam folder if you don't see it.
        </p>
        <p className="mt-6 text-sm text-brand-mid-grey">
          <Link
            to="/auth/login"
            className="text-brand-near-black font-semibold hover:underline"
          >
            ← Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-brand-near-black mb-2">
        Forgot your password?
      </h1>
      <p className="text-brand-mid-grey mb-8 text-sm">
        Enter your email and we'll send a reset link.
      </p>

      <form onSubmit={handleRequestReset} className="space-y-5" noValidate>
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
        <Button
          type="submit"
          className="w-full bg-brand-black text-white hover:bg-brand-near-black"
          disabled={requestLoading}
        >
          {requestLoading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-brand-mid-grey">
        <Link
          to="/auth/login"
          className="text-brand-near-black font-semibold hover:underline"
        >
          ← Back to sign in
        </Link>
      </p>
    </>
  );
}
