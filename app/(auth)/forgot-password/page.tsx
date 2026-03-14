"use client";

import Link from "next/link";
import { useState } from "react";

import { ArrowLeft, ArrowRight, KeyRound, Mail } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) throw new Error(error.message);
      }

      setSent(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send reset email.");
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
              <KeyRound className="size-5 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--cb-font-display)" }}>
              Reset your password
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <CardContent className="p-6">
            {sent ? (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50">
                  <Mail className="size-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Check your email</p>
                  <p className="mt-1 text-sm text-slate-500">
                    We sent a password reset link to <span className="font-medium text-slate-700">{email}</span>.
                    Click the link in the email to set a new password.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="landing-outline-btn w-full"
                  onClick={() => { setSent(false); setEmail(""); }}
                >
                  Send to a different email
                </Button>
                <p className="text-sm text-slate-500">
                  <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-700">
                    Back to sign in
                  </Link>
                </p>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="portal-field">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="landing-primary-btn h-11 w-full text-[0.9rem]"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send reset link"}
                  <ArrowRight className="ml-2 size-4" />
                </Button>

                <p className="text-center text-sm text-slate-500">
                  Remember your password?{" "}
                  <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-700">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
