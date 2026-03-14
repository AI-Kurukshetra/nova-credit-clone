"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { signUpSchema } from "@/lib/validations";

export default function OnboardPage() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    consentDataProcessing: false,
    consentTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSignUp(): Promise<void> {
    const parsed = signUpSchema.safeParse(formState);

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
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email: formState.email,
          password: formState.password,
          options: {
            data: {
              first_name: formState.firstName,
              last_name: formState.lastName,
              consent_given: true,
              consent_at: new Date().toISOString(),
            },
          },
        });

        if (error) {
          console.error("[CreditBridge] Signup error:", error.message, error);
          throw new Error(error.message);
        }

        if (!data.user) {
          console.error("[CreditBridge] Signup returned no user and no error");
          throw new Error("Signup failed — no user returned. Please try again.");
        }

        // Supabase returns user without identities for already-registered emails
        // (email enumeration protection). Treat as error.
        if (data.user.identities && data.user.identities.length === 0) {
          toast.error("An account with this email already exists. Please sign in.");
          setLoading(false);
          return;
        }

        // Insert into public.users table so the app can reference this user
        const { error: insertError } = await supabase
          .from("users")
          .upsert(
            {
              id: data.user.id,
              email: formState.email,
              role: "consumer",
              full_name: `${formState.firstName} ${formState.lastName}`.trim(),
              metadata: {
                first_name: formState.firstName,
                last_name: formState.lastName,
                consent_given: true,
                consent_at: new Date().toISOString(),
              },
            },
            { onConflict: "id" },
          );

        if (insertError) {
          console.error("[CreditBridge] Failed to insert public.users row:", insertError);
          // Don't block signup — auth user was created successfully
        }

        if (!data.session) {
          // Email confirmation is enabled — user was created but needs to verify
          toast.success("Account created! Check your email to confirm, then sign in.");
          router.push("/signin");
          return;
        }

        // Session exists — email confirmation is disabled, user is fully signed up and logged in
        toast.success("Account created — welcome to CreditBridge!");
        router.push("/dashboard");
        return;
      }

      // No Supabase configured — demo mode
      toast.success("Account created (demo mode) — welcome to CreditBridge!");
      router.push("/dashboard");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create account.";
      if (message.toLowerCase().includes("rate limit")) {
        toast.error(
          "Email rate limit exceeded. Please wait a few minutes or disable email confirmation in Supabase.",
        );
      } else {
        toast.error(message);
      }
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
              <Sparkles className="size-5 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--cb-font-display)" }}>
              Create your account
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Get started in seconds — complete your credit profile after sign up.
            </p>
          </div>

          <CardContent className="space-y-5 p-6">
            {/* Name */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="portal-field">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  value={formState.firstName}
                  onChange={(e) => setFormState((s) => ({ ...s, firstName: e.target.value }))}
                />
                {errors.firstName ? <p className="portal-inline-error">{errors.firstName}</p> : null}
              </div>
              <div className="portal-field">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  value={formState.lastName}
                  onChange={(e) => setFormState((s) => ({ ...s, lastName: e.target.value }))}
                />
                {errors.lastName ? <p className="portal-inline-error">{errors.lastName}</p> : null}
              </div>
            </div>

            {/* Email */}
            <div className="portal-field">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formState.email}
                onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
              />
              {errors.email ? <p className="portal-inline-error">{errors.email}</p> : null}
            </div>

            {/* Password */}
            <div className="portal-field">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters, 1 uppercase, 1 number"
                value={formState.password}
                onChange={(e) => setFormState((s) => ({ ...s, password: e.target.value }))}
              />
              {errors.password ? <p className="portal-inline-error">{errors.password}</p> : null}
            </div>

            {/* Consent */}
            <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent-data"
                  checked={formState.consentDataProcessing}
                  onCheckedChange={(c) => setFormState((s) => ({ ...s, consentDataProcessing: Boolean(c) }))}
                />
                <Label htmlFor="consent-data" className="text-sm leading-relaxed text-slate-600">
                  I consent to my foreign credit data being processed by CreditBridge.
                </Label>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="consent-terms"
                  checked={formState.consentTerms}
                  onCheckedChange={(c) => setFormState((s) => ({ ...s, consentTerms: Boolean(c) }))}
                />
                <Label htmlFor="consent-terms" className="text-sm leading-relaxed text-slate-600">
                  I agree to the{" "}
                  <Link href="/terms" className="font-medium text-indigo-600 underline underline-offset-2">Terms</Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-indigo-600 underline underline-offset-2">Privacy Policy</Link>.
                </Label>
              </div>
              {errors.consentDataProcessing ? <p className="portal-inline-error">{errors.consentDataProcessing}</p> : null}
              {errors.consentTerms ? <p className="portal-inline-error">{errors.consentTerms}</p> : null}
            </div>

            {/* Submit */}
            <Button
              className="landing-primary-btn h-11 w-full text-[0.9rem]"
              onClick={handleSignUp}
              disabled={loading || !formState.consentDataProcessing || !formState.consentTerms}
            >
              {loading ? "Creating account..." : "Create account"}
              <ArrowRight className="ml-2 size-4" />
            </Button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link href="/signin" className="font-medium text-indigo-600 hover:text-indigo-700">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            { icon: ShieldCheck, text: "No hard pull" },
            { icon: Globe2, text: "5 countries" },
            { icon: CheckCircle2, text: "Bank-grade security" },
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
