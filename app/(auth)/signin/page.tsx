"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_SUBTEXT } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { signInSchema } from "@/lib/validations";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors = Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      );
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw error;
        }
      }

      toast.success("Signed in successfully");
      router.push("/dashboard");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="portal-shell portal-auth-shell">
      <div className="portal-ambient portal-ambient-a" aria-hidden />
      <div className="portal-ambient portal-ambient-b" aria-hidden />

      <div className="portal-auth-frame">
        <div className="flex items-center justify-between gap-4">
          <Logo className="text-slate-50" />
          <div className="flex items-center gap-3">
            <span className="portal-pill-note">Secure account access</span>
            <Badge className="portal-chip">Consumer Access</Badge>
          </div>
        </div>

        <div className="portal-auth-grid">
          <Card className="portal-auth-aside">
            <CardContent className="space-y-6 p-0">
              <div className="space-y-4">
                <p className="portal-kicker">Welcome Back</p>
                <h1 className="portal-title">Continue where your credit story left off.</h1>
                <p className="portal-copy max-w-xl text-base">{APP_SUBTEXT}</p>
              </div>

              <div className="portal-auth-stack">
                <span className="portal-chip">
                  <ShieldCheck className="size-4" />
                  Bank-grade session security
                </span>
                <span className="portal-chip">
                  <Sparkles className="size-4" />
                  Continuous score visibility
                </span>
              </div>

              <div className="portal-hero-banner">
                <p className="portal-kicker">What you can do here</p>
                <div className="mt-4 grid gap-3">
                  <div className="portal-pill-note">Review score updates and lender activity</div>
                  <div className="portal-pill-note">Upload fresh documents into the same vault</div>
                  <div className="portal-pill-note">Control how your translated profile is shared</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="portal-auth-main">
            <CardHeader className="space-y-3 px-0">
              <p className="portal-kicker">Sign In</p>
              <CardTitle className="portal-subtitle">Access your CreditBridge account</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <form className="portal-form-grid" onSubmit={handleSignIn}>
                <div className="portal-field">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                  {errors.email ? <p className="portal-inline-error">{errors.email}</p> : null}
                </div>

                <div className="portal-field">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                  {errors.password ? <p className="portal-inline-error">{errors.password}</p> : null}
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </form>

              <p className="mt-5 text-sm text-slate-200/85">
                New to CreditBridge?{" "}
                <Link href="/onboard" className="portal-ghost-link">
                  Start onboarding
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
