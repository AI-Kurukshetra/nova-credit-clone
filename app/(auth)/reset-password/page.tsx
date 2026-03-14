"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Supabase will redirect here with a session token in the URL hash.
  // We need to wait for Supabase to pick up the session from the URL.
  useEffect(() => {
    async function checkSession() {
      try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          setReady(true);
          return;
        }

        const supabase = createClient();

        // Listen for the PASSWORD_RECOVERY event
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY") {
            setReady(true);
          }
        });

        // Also check if there's already a session (user clicked link and session was set)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setReady(true);
        }

        return () => subscription.unsubscribe();
      } catch {
        setReady(true);
      }
    }

    checkSession();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must include an uppercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must include a number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) throw new Error(updateError.message);
      }

      setSuccess(true);
      toast.success("Password updated successfully!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="portal-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-block">
            <Logo />
          </div>
        </div>

        <Card className="onboard-card overflow-hidden border-slate-200 shadow-lg">
          <div className="onboard-header-band px-6 py-5 text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-white/90 shadow-sm">
              <ShieldCheck className="size-5 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--cb-font-display)" }}>
              {success ? "Password updated" : "Set new password"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {success
                ? "Your password has been changed successfully."
                : "Choose a strong password for your account."}
            </p>
          </div>

          <CardContent className="p-6">
            {success ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="size-6 text-emerald-600" />
                </div>
                <p className="text-sm text-slate-500">You can now sign in with your new password.</p>
                <Button
                  className="landing-primary-btn h-11 w-full text-[0.9rem]"
                  onClick={() => router.push("/signin")}
                >
                  Go to sign in
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            ) : !ready ? (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500">Verifying your reset link...</p>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="portal-field">
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Min. 8 characters, 1 uppercase, 1 number"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="portal-field">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {error ? <p className="portal-inline-error">{error}</p> : null}

                <Button
                  type="submit"
                  className="landing-primary-btn h-11 w-full text-[0.9rem]"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update password"}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
