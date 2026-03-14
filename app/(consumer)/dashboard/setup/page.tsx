"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Globe2,
  Rocket,
  Upload,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const DocumentUploadZone = dynamic(() => import("@/components/shared/document-upload-zone").then((m) => m.DocumentUploadZone), {
  loading: () => (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 rounded bg-slate-100" />
            <Skeleton className="h-3 w-48 rounded bg-slate-100" />
          </div>
          <Skeleton className="h-9 w-20 rounded-lg bg-slate-100" />
        </div>
      ))}
    </div>
  ),
  ssr: false,
});

const ProcessingSteps = dynamic(() => import("@/components/shared/processing-steps").then((m) => m.ProcessingSteps), {
  loading: () => (
    <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-5 py-8">
      <div className="space-y-2">
        <Skeleton className="h-5 w-48 rounded bg-slate-100" />
        <Skeleton className="h-3 w-72 rounded bg-slate-100" />
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <Skeleton className="size-8 shrink-0 rounded-full bg-slate-100" />
          <Skeleton className="h-4 w-48 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  ),
  ssr: false,
});
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  IMMIGRATION_STATUSES,
  SUPPORTED_COUNTRIES,
  US_STATES,
} from "@/lib/constants";
import {
  homeCountrySchema,
  personalInfoSchema,
} from "@/lib/validations";

type SetupStep = 1 | 2 | 3 | 4;

const stepMeta = [
  { step: 1 as SetupStep, label: "Profile", icon: User },
  { step: 2 as SetupStep, label: "Country", icon: Globe2 },
  { step: 3 as SetupStep, label: "Documents", icon: Upload },
  { step: 4 as SetupStep, label: "Processing", icon: Rocket },
];

export default function DashboardSetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<SetupStep>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    usState: "",
    immigrationStatus: "",
    countryCode: "GB" as "GB" | "CA" | "AU" | "IN" | "MX",
  });

  const selectedCountry = useMemo(
    () => SUPPORTED_COUNTRIES.find((c) => c.code === formState.countryCode),
    [formState.countryCode],
  );

  const progress = Math.round((step / 4) * 100);

  function handleStepOne(): void {
    const parsed = personalInfoSchema.safeParse({
      firstName: formState.firstName,
      lastName: formState.lastName,
      usState: formState.usState,
      immigrationStatus: formState.immigrationStatus,
    });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [i.path.join("."), i.message])));
      return;
    }
    setErrors({});
    setStep(2);
  }

  function handleStepTwo(): void {
    const parsed = homeCountrySchema.safeParse({ countryCode: formState.countryCode });
    if (!parsed.success) {
      setErrors({ countryCode: "Please select your home country." });
      return;
    }
    setErrors({});
    setStep(3);
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900" style={{ fontFamily: "var(--cb-font-display)" }}>
            Complete your profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A few details to translate your credit history into a US-ready profile.
          </p>
        </div>
        <Badge className="border-indigo-200 bg-indigo-50 text-sm font-semibold text-indigo-600">
          {progress}% done
        </Badge>
      </div>

      {/* Step indicator */}
      <div className="setup-step-bar">
        {stepMeta.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.step;
          const isComplete = step > s.step;
          return (
            <div key={s.step} className="flex items-center gap-2">
              {i > 0 && (
                <div className={`setup-step-connector ${isComplete ? "is-done" : ""}`} />
              )}
              <div className={`setup-step-dot ${isActive ? "is-active" : ""} ${isComplete ? "is-done" : ""}`}>
                {isComplete ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
              </div>
              <span className={`hidden text-sm font-medium sm:inline ${isActive ? "text-indigo-600" : isComplete ? "text-slate-800" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <Progress value={progress} className="h-1.5" />

      {/* Step content */}
      <Card className="setup-card border-slate-200 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          {/* ── Step 1: Personal Info ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Personal information</h2>
                <p className="mt-1 text-sm text-slate-500">Tell us who you are and where you live in the US.</p>
              </div>

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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="portal-field">
                  <Label>Current US state</Label>
                  <Select value={formState.usState} onValueChange={(v) => setFormState((s) => ({ ...s, usState: v ?? "" }))}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {US_STATES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.usState ? <p className="portal-inline-error">{errors.usState}</p> : null}
                </div>
                <div className="portal-field">
                  <Label>Immigration status</Label>
                  <Select value={formState.immigrationStatus} onValueChange={(v) => setFormState((s) => ({ ...s, immigrationStatus: v ?? "" }))}>
                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {IMMIGRATION_STATUSES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.immigrationStatus ? <p className="portal-inline-error">{errors.immigrationStatus}</p> : null}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href="/dashboard"><ArrowLeft className="mr-2 size-4" />Back to dashboard</Link>
                </Button>
                <Button className="landing-primary-btn" onClick={handleStepOne}>
                  Continue <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Country Selection ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Where is your credit history from?</h2>
                <p className="mt-1 text-sm text-slate-500">Select the country whose bureau data we should translate.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {SUPPORTED_COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setFormState((s) => ({ ...s, countryCode: country.code }))}
                    className={`setup-country-btn ${formState.countryCode === country.code ? "is-selected" : ""}`}
                  >
                    <span className="text-2xl">{country.flag}</span>
                    <span className="mt-2 text-sm font-semibold text-slate-800">{country.name}</span>
                    <span className="text-[0.65rem] font-medium tracking-wider text-slate-400 uppercase">{country.bureau}</span>
                  </button>
                ))}
              </div>
              {errors.countryCode ? <p className="portal-inline-error">{errors.countryCode}</p> : null}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 size-4" />Back
                </Button>
                <Button className="landing-primary-btn" onClick={handleStepTwo}>
                  Continue <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Document Upload ── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Upload source documents</h2>
                <p className="mt-1 text-sm text-slate-500">We validate type and size live, then use these files to generate your translated profile.</p>
              </div>

              <DocumentUploadZone
                slots={[
                  { key: "credit_report", label: "Foreign Credit Report", helpText: "PDF from your home country bureau", required: true },
                  { key: "passport", label: "Passport or National ID", helpText: "For identity verification", required: true },
                  { key: "bank_statement", label: "Bank Statements", helpText: "Last 3 months from any bank" },
                ]}
                showSkipBankLink
              />

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 size-4" />Back
                </Button>
                <Button className="landing-primary-btn" onClick={() => setStep(4)}>
                  Start Processing <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Processing ── */}
          {step === 4 && (
            <div className="space-y-6">
              <ProcessingSteps countryLabel={selectedCountry?.name ?? "your"} />
              <div className="flex justify-center">
                <Button className="landing-primary-btn" onClick={() => { toast.success("Profile setup complete!"); router.push("/dashboard"); }}>
                  Go to Dashboard <ArrowRight className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
