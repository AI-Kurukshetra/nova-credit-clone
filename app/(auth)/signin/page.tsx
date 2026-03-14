"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="portal-shell flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="inline-block">
            <Logo />
          </div>
        </div>

        {/* Main card */}
        <Card className="onboard-card overflow-hidden border-slate-200 shadow-lg">
          {/* Header band */}
          <div className="onboard-header-band px-6 py-5 text-center">
            <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-white/90 shadow-sm">
              <LogIn className="size-5 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--cb-font-display)" }}>
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Sign in to continue where your credit story left off.
            </p>
          </div>

          <CardContent className="p-6">
            <form className="space-y-5" onSubmit={handleSignIn}>
              {/* Email */}
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
                {errors.email ? <p className="portal-inline-error">{errors.email}</p> : null}
              </div>

              {/* Password */}
              <div className="portal-field">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {errors.password ? <p className="portal-inline-error">{errors.password}</p> : null}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="landing-primary-btn h-11 w-full text-[0.9rem]"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              New to CreditBridge?{" "}
              <Link href="/onboard" className="font-medium text-indigo-600 hover:text-indigo-700">
                Create an account
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            { icon: ShieldCheck, text: "Bank-grade security" },
            { icon: Globe2, text: "5 countries" },
            { icon: CheckCircle2, text: "No hard pull" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <span key={item.text} className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Icon className="size-3.5" />
                {item.text}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
