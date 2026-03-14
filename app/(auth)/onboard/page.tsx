"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Upload,
  WandSparkles,
} from "lucide-react";
import { toast } from "sonner";

import { DocumentUploadZone } from "@/components/shared/document-upload-zone";
import { Logo } from "@/components/shared/logo";
import { ProcessingSteps } from "@/components/shared/processing-steps";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APP_SUBTEXT,
  IMMIGRATION_STATUSES,
  SUPPORTED_COUNTRIES,
  US_STATES,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import {
  homeCountrySchema,
  personalInfoSchema,
  signUpSchema,
} from "@/lib/validations";

type OnboardStep = 1 | 2 | 3 | 4 | 5;

interface OnboardFormState {
  email: string;
  password: string;
  confirmPassword: string;
  consentDataProcessing: boolean;
  consentTerms: boolean;
  firstName: string;
  lastName: string;
  usState: string;
  immigrationStatus: string;
  countryCode: "GB" | "CA" | "AU" | "IN" | "MX";
}

const initialState: OnboardFormState = {
  email: "",
  password: "",
  confirmPassword: "",
  consentDataProcessing: false,
  consentTerms: false,
  firstName: "",
  lastName: "",
  usState: "",
  immigrationStatus: "",
  countryCode: "GB",
};

const stepMeta = [
  {
    step: 1 as OnboardStep,
    label: "Account",
    description: "Create secure access and record compliance consent.",
  },
  {
    step: 2 as OnboardStep,
    label: "Identity",
    description: "Tell us who you are and where you live in the US.",
  },
  {
    step: 3 as OnboardStep,
    label: "Origin",
    description: "Select the country your credit history comes from.",
  },
  {
    step: 4 as OnboardStep,
    label: "Documents",
    description: "Upload the files needed to translate your profile.",
  },
  {
    step: 5 as OnboardStep,
    label: "Processing",
    description: "We normalize your history into a US-ready score.",
  },
] as const;

export default function OnboardPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardStep>(1);
  const [formState, setFormState] = useState<OnboardFormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const selectedCountry = useMemo(
    () => SUPPORTED_COUNTRIES.find((country) => country.code === formState.countryCode),
    [formState.countryCode],
  );

  async function handleStepOne(): Promise<void> {
    const parsed = signUpSchema.safeParse({
      email: formState.email,
      password: formState.password,
      confirmPassword: formState.confirmPassword,
      consentDataProcessing: formState.consentDataProcessing,
      consentTerms: formState.consentTerms,
    });

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
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email: formState.email,
          password: formState.password,
          options: {
            data: {
              consent_given: true,
              consent_at: new Date().toISOString(),
            },
          },
        });

        if (error) {
          throw new Error(error.message);
        }

        if (data.user && !data.session) {
          toast.success("Check your email to confirm your account, then continue.");
        } else {
          toast.success("Account created successfully");
        }
      } else {
        toast.success("Account created (demo mode)");
      }

      setStep(2);
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

  function handleStepTwo(): void {
    const parsed = personalInfoSchema.safeParse({
      firstName: formState.firstName,
      lastName: formState.lastName,
      usState: formState.usState,
      immigrationStatus: formState.immigrationStatus,
    });

    if (!parsed.success) {
      const fieldErrors = Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      );
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStep(3);
  }

  function handleStepThree(): void {
    const parsed = homeCountrySchema.safeParse({
      countryCode: formState.countryCode,
    });

    if (!parsed.success) {
      setErrors({ countryCode: "Please select your home country." });
      return;
    }

    setErrors({});
    setStep(4);
  }

  return (
    <div className="portal-shell portal-auth-shell">
      <div className="portal-ambient portal-ambient-a" aria-hidden />
      <div className="portal-ambient portal-ambient-b" aria-hidden />

      <div className="portal-auth-frame max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Logo className="text-slate-50" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="portal-pill-note">Consumer onboarding journey</span>
            <Badge className="portal-chip">Step {step} of 5</Badge>
          </div>
        </div>

        <div className="portal-auth-grid">
          <Card className="portal-auth-aside">
            <CardContent className="space-y-6 p-0">
              <div className="space-y-4">
                <p className="portal-kicker">Consumer Onboarding</p>
                <h1 className="portal-title">Build a lender-ready credit identity.</h1>
                <p className="portal-copy max-w-xl text-base">{APP_SUBTEXT}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="portal-chip">
                  <ShieldCheck className="size-4" />
                  No hard pull
                </span>
                <span className="portal-chip">
                  <Globe2 className="size-4" />
                  Cross-border normalization
                </span>
                <span className="portal-chip">
                  <WandSparkles className="size-4" />
                  Share-ready reporting
                </span>
              </div>

              <div className="portal-hero-banner">
                <p className="portal-kicker">What lenders receive</p>
                <div className="mt-4 grid gap-3">
                  <div className="portal-pill-note">Translated score benchmarked to US expectations</div>
                  <div className="portal-pill-note">Masked identity until you share with a lender</div>
                  <div className="portal-pill-note">Document-backed timeline and risk context</div>
                </div>
              </div>

              <div className="portal-step-rail">
                {stepMeta.map((item) => {
                  const isActive = step === item.step;
                  const isComplete = step > item.step;

                  return (
                    <div
                      key={item.step}
                      className={`portal-step-item${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}
                    >
                      <div className="portal-step-index">
                        {isComplete ? <CheckCircle2 className="size-4" /> : item.step}
                      </div>
                      <div>
                        <p className="portal-step-label">{item.label}</p>
                        <p className="portal-step-copy">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="portal-hero-banner space-y-3">
              <Progress value={(step / 5) * 100} />
              <div className="flex items-center justify-between text-sm text-slate-200/80">
                <span>{stepMeta[step - 1]?.label}</span>
                <span>{Math.round((step / 5) * 100)}% complete</span>
              </div>
              <p className="portal-copy text-sm">
                A premium, lender-facing identity is built as you complete each step. Nothing is
                plain, and every field is validated before it moves forward.
              </p>
            </div>

            <Card className="portal-auth-main">
              <CardHeader className="space-y-3 px-0">
                <p className="portal-kicker">
                  {step === 1 && "Account Setup"}
                  {step === 2 && "Profile Details"}
                  {step === 3 && "Country Selection"}
                  {step === 4 && "Document Intake"}
                  {step === 5 && "Translation Engine"}
                </p>
                <CardTitle className="portal-subtitle">
                  {step === 1 && "Create your account"}
                  {step === 2 && "Personal information"}
                  {step === 3 && "Where is your credit history from?"}
                  {step === 4 && "Upload the source documents"}
                  {step === 5 && "Processing your score"}
                </CardTitle>
              </CardHeader>

              <CardContent className="px-0">
                {step === 1 ? (
                  <div className="portal-form-grid">
                    <div className="portal-field">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formState.email}
                        onChange={(event) =>
                          setFormState((previous) => ({
                            ...previous,
                            email: event.target.value,
                          }))
                        }
                      />
                      {errors.email ? <p className="portal-inline-error">{errors.email}</p> : null}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="portal-field">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formState.password}
                          onChange={(event) =>
                            setFormState((previous) => ({
                              ...previous,
                              password: event.target.value,
                            }))
                          }
                        />
                        {errors.password ? (
                          <p className="portal-inline-error">{errors.password}</p>
                        ) : null}
                      </div>

                      <div className="portal-field">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formState.confirmPassword}
                          onChange={(event) =>
                            setFormState((previous) => ({
                              ...previous,
                              confirmPassword: event.target.value,
                            }))
                          }
                        />
                        {errors.confirmPassword ? (
                          <p className="portal-inline-error">{errors.confirmPassword}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="portal-consent-block">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="consent-data"
                          checked={formState.consentDataProcessing}
                          onCheckedChange={(checked) =>
                            setFormState((previous) => ({
                              ...previous,
                              consentDataProcessing: Boolean(checked),
                            }))
                          }
                        />
                        <Label htmlFor="consent-data" className="leading-relaxed text-slate-100">
                          I consent to my foreign credit data being processed by CreditBridge.
                        </Label>
                      </div>

                      <div className="mt-4 flex items-start gap-3">
                        <Checkbox
                          id="consent-terms"
                          checked={formState.consentTerms}
                          onCheckedChange={(checked) =>
                            setFormState((previous) => ({
                              ...previous,
                              consentTerms: Boolean(checked),
                            }))
                          }
                        />
                        <Label htmlFor="consent-terms" className="leading-relaxed text-slate-100">
                          I agree to the Terms of Service and Privacy Policy.
                        </Label>
                      </div>
                    </div>

                    {errors.consentDataProcessing ? (
                      <p className="portal-inline-error">{errors.consentDataProcessing}</p>
                    ) : null}
                    {errors.consentTerms ? (
                      <p className="portal-inline-error">{errors.consentTerms}</p>
                    ) : null}

                    <div className="portal-actions">
                      <Link href="/signin" className="portal-ghost-link">
                        Already have an account? Sign in
                      </Link>
                      <Button
                        onClick={handleStepOne}
                        disabled={
                          loading ||
                          !formState.consentDataProcessing ||
                          !formState.consentTerms
                        }
                      >
                        {loading ? "Creating account..." : "Continue"}
                        <ArrowRight data-icon="inline-end" />
                      </Button>
                    </div>
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="portal-form-grid">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="portal-field">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                          id="firstName"
                          value={formState.firstName}
                          onChange={(event) =>
                            setFormState((previous) => ({
                              ...previous,
                              firstName: event.target.value,
                            }))
                          }
                        />
                        {errors.firstName ? (
                          <p className="portal-inline-error">{errors.firstName}</p>
                        ) : null}
                      </div>

                      <div className="portal-field">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                          id="lastName"
                          value={formState.lastName}
                          onChange={(event) =>
                            setFormState((previous) => ({
                              ...previous,
                              lastName: event.target.value,
                            }))
                          }
                        />
                        {errors.lastName ? (
                          <p className="portal-inline-error">{errors.lastName}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="portal-field">
                        <Label>Current US state</Label>
                        <Select
                          value={formState.usState}
                          onValueChange={(value) =>
                            setFormState((previous) => ({
                              ...previous,
                              usState: value ?? "",
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {US_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {errors.usState ? (
                          <p className="portal-inline-error">{errors.usState}</p>
                        ) : null}
                      </div>

                      <div className="portal-field">
                        <Label>Immigration status</Label>
                        <Select
                          value={formState.immigrationStatus}
                          onValueChange={(value) =>
                            setFormState((previous) => ({
                              ...previous,
                              immigrationStatus: value ?? "",
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select immigration status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {IMMIGRATION_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {errors.immigrationStatus ? (
                          <p className="portal-inline-error">{errors.immigrationStatus}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="portal-actions">
                      <Button variant="outline" onClick={() => setStep(1)}>
                        <ArrowLeft data-icon="inline-start" />
                        Back
                      </Button>
                      <Button onClick={handleStepTwo}>
                        Continue
                        <ArrowRight data-icon="inline-end" />
                      </Button>
                    </div>
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="space-y-4">
                    <div className="portal-country-grid lg:grid-cols-3">
                      {SUPPORTED_COUNTRIES.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() =>
                            setFormState((previous) => ({
                              ...previous,
                              countryCode: country.code,
                            }))
                          }
                          className={`portal-country-choice${
                            formState.countryCode === country.code ? " is-selected" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="portal-country-code">{country.code}</span>
                            <span className="portal-chip">Mapped</span>
                          </div>
                          <div className="mt-5 flex items-center gap-3">
                            <span className="portal-country-flag" aria-hidden>
                              {country.flag}
                            </span>
                            <p className="text-lg font-semibold text-white">{country.name}</p>
                          </div>
                          <p className="mt-2 text-sm text-slate-200/85">{country.bureau}</p>
                          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-cyan-100/80">
                            Bureau translation ready
                          </p>
                        </button>
                      ))}
                    </div>
                    {errors.countryCode ? (
                      <p className="portal-inline-error">{errors.countryCode}</p>
                    ) : null}

                    <div className="portal-actions">
                      <Button variant="outline" onClick={() => setStep(2)}>
                        <ArrowLeft data-icon="inline-start" />
                        Back
                      </Button>
                      <Button onClick={handleStepThree}>
                        Continue
                        <ArrowRight data-icon="inline-end" />
                      </Button>
                    </div>
                  </div>
                ) : null}

                {step === 4 ? (
                  <div className="space-y-5">
                    <div className="portal-hero-banner flex items-start gap-3 p-4">
                      <Upload className="mt-0.5 text-cyan-200" />
                      <div>
                        <p className="font-medium text-white">Upload documents once</p>
                        <p className="mt-1 text-sm text-slate-200/80">
                          We validate type and size live, then use these files to generate your
                          translated profile.
                        </p>
                      </div>
                    </div>

                    <DocumentUploadZone
                      slots={[
                        {
                          key: "credit_report",
                          label: "Foreign Credit Report",
                          helpText: "PDF from your home country bureau",
                          required: true,
                        },
                        {
                          key: "passport",
                          label: "Passport or National ID",
                          helpText: "For identity verification",
                          required: true,
                        },
                        {
                          key: "bank_statement",
                          label: "Bank Statements",
                          helpText: "Last 3 months from any bank",
                        },
                      ]}
                      showSkipBankLink
                    />

                    <div className="portal-actions">
                      <Button variant="outline" onClick={() => setStep(3)}>
                        <ArrowLeft data-icon="inline-start" />
                        Back
                      </Button>
                      <Button onClick={() => setStep(5)}>
                        Start Processing
                        <ArrowRight data-icon="inline-end" />
                      </Button>
                    </div>
                  </div>
                ) : null}

                {step === 5 ? (
                  <ProcessingSteps countryLabel={selectedCountry?.name ?? "your"} />
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-200/70">
          <CheckCircle2 className="text-emerald-300" />
          Your consent timestamp will be stored for compliance and audit requirements.
        </div>

        <Button variant="ghost" className="w-fit" onClick={() => router.push("/")}>
          <ArrowLeft data-icon="inline-start" />
          Back to landing page
        </Button>
      </div>
    </div>
  );
}
