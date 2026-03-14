"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  KeyRound,
  Send,
  ShieldCheck,
  Sparkles,
  Webhook,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_SUBTEXT } from "@/lib/constants";
import { generateClientApiKey } from "@/lib/api-key-client";
import { lenderOnboardingSchema } from "@/lib/validations";

const useCaseOptions = [
  "Mortgage loans",
  "Auto loans",
  "Personal loans",
  "Credit cards",
  "Rental screening",
] as const;

type Step = 1 | 2 | 3 | 4;

const lenderSteps = [
  {
    step: 1 as Step,
    label: "Company",
    description: "Capture operating details and regulatory identity.",
  },
  {
    step: 2 as Step,
    label: "Use Cases",
    description: "Define how your team will consume translated credit data.",
  },
  {
    step: 3 as Step,
    label: "API Key",
    description: "Generate the one-time credential for secure integration.",
  },
  {
    step: 4 as Step,
    label: "Webhook",
    description: "Connect decision events back into your lending stack.",
  },
] as const;

export default function LenderOnboardPage() {
  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiKeyState, setApiKeyState] = useState(() => generateClientApiKey());
  const [copied, setCopied] = useState(false);

  const [formState, setFormState] = useState({
    companyName: "",
    licenseNumber: "",
    stateOfOperation: "",
    companyType: "Community Bank",
    useCases: [] as string[],
    webhookUrl: "",
  });

  const sampleCurl = useMemo(
    () =>
      `curl -H "Authorization: Bearer ${apiKeyState.key}" \\\n  https://creditbridge.app/api/v1/credit-profiles/{id}`,
    [apiKeyState.key],
  );

  function handleStepOne(): void {
    if (!formState.companyName.trim()) {
      setErrors({ companyName: "Company name is required." });
      return;
    }
    setErrors({});
    setStep(2);
  }

  function handleStepTwo(): void {
    if (!formState.useCases.length) {
      setErrors({ useCases: "Select at least one use case." });
      return;
    }
    setErrors({});
    setApiKeyState(generateClientApiKey());
    setStep(3);
  }

  function handleComplete(): void {
    const parsed = lenderOnboardingSchema.safeParse(formState);
    if (!parsed.success) {
      const fieldErrors = Object.fromEntries(
        parsed.error.issues.map((issue) => [issue.path.join("."), issue.message]),
      );
      setErrors(fieldErrors);
      toast.error("Please resolve validation issues.");
      return;
    }

    toast.success("Lender onboarding completed");
    setStep(4);
  }

  async function handleCopy(): Promise<void> {
    await navigator.clipboard.writeText(apiKeyState.key);
    setCopied(true);
    toast.success("API key copied to clipboard");
  }

  function toggleUseCase(useCase: string, checked: boolean): void {
    setFormState((previous) => ({
      ...previous,
      useCases: checked
        ? [...previous.useCases, useCase]
        : previous.useCases.filter((value) => value !== useCase),
    }));
  }

  return (
    <div className="portal-shell portal-auth-shell">
      <div className="portal-ambient portal-ambient-a" aria-hidden />
      <div className="portal-ambient portal-ambient-b" aria-hidden />

      <div className="portal-auth-frame max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <Logo className="text-slate-50" />
          <div className="flex items-center gap-3">
            <span className="portal-pill-note">Institution setup</span>
            <Badge className="portal-chip">Step {step} of 4</Badge>
          </div>
        </div>

        <div className="portal-auth-grid">
          <Card className="portal-auth-aside">
            <CardContent className="space-y-6 p-0">
              <div className="space-y-4">
                <p className="portal-kicker">Lender Onboarding</p>
                <h1 className="portal-title">Integrate cross-border credit with a premium operating layer.</h1>
                <p className="portal-copy max-w-xl text-base">{APP_SUBTEXT}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="portal-chip">
                  <ShieldCheck className="size-4" />
                  Compliance-ready reports
                </span>
                <span className="portal-chip">
                  <Sparkles className="size-4" />
                  API-first workflows
                </span>
                <span className="portal-chip">
                  <Webhook className="size-4" />
                  Live webhook delivery
                </span>
              </div>

              <div className="portal-hero-banner">
                <p className="portal-kicker">Implementation track</p>
                <div className="mt-4 grid gap-3">
                  <div className="portal-pill-note">Generate API credentials once</div>
                  <div className="portal-pill-note">Map use cases to underwriting workflows</div>
                  <div className="portal-pill-note">Push webhook events into your stack</div>
                </div>
              </div>

              <div className="portal-step-rail">
                {lenderSteps.map((item) => {
                  const isActive = step === item.step;
                  const isComplete = step > item.step;

                  return (
                    <div
                      key={item.step}
                      className={`portal-step-item${isActive ? " is-active" : ""}${isComplete ? " is-complete" : ""}`}
                    >
                      <div className="portal-step-index">{isComplete ? <Check className="size-4" /> : item.step}</div>
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

          <Card className="portal-auth-main">
            <CardHeader className="space-y-3 px-0">
              <p className="portal-kicker">
                {step === 1 && "Institution Setup"}
                {step === 2 && "Workflow Design"}
                {step === 3 && "Credential Generation"}
                {step === 4 && "Event Delivery"}
              </p>
              <CardTitle className="portal-subtitle">
                {step === 1 && "Company details"}
                {step === 2 && "Use cases"}
                {step === 3 && "API key generated"}
                {step === 4 && "Webhook setup"}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 px-0">
              {step === 1 ? (
                <div className="portal-form-grid">
                  <div className="portal-field">
                    <Label htmlFor="company-name">Company name</Label>
                    <Input
                      id="company-name"
                      value={formState.companyName}
                      onChange={(event) =>
                        setFormState((previous) => ({
                          ...previous,
                          companyName: event.target.value,
                        }))
                      }
                    />
                    {errors.companyName ? <p className="portal-inline-error">{errors.companyName}</p> : null}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="portal-field">
                      <Label htmlFor="license-number">License number</Label>
                      <Input
                        id="license-number"
                        value={formState.licenseNumber}
                        onChange={(event) =>
                          setFormState((previous) => ({
                            ...previous,
                            licenseNumber: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="portal-field">
                      <Label htmlFor="state">State of operation</Label>
                      <Input
                        id="state"
                        value={formState.stateOfOperation}
                        onChange={(event) =>
                          setFormState((previous) => ({
                            ...previous,
                            stateOfOperation: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="portal-field">
                    <Label>Company type</Label>
                    <Select
                      value={formState.companyType}
                      onValueChange={(value) =>
                        setFormState((previous) => ({
                          ...previous,
                          companyType: value ?? "",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {["Community Bank", "Credit Union", "Mortgage Lender", "Auto Lender", "Other"].map(
                            (type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ),
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="portal-actions">
                    <Link href="/" className="portal-ghost-link">Back to landing page</Link>
                    <Button onClick={handleStepOne}>
                      Continue
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {useCaseOptions.map((option) => (
                      <label
                        key={option}
                        className="portal-upload-slot flex items-center gap-3 rounded-2xl"
                      >
                        <Checkbox
                          checked={formState.useCases.includes(option)}
                          onCheckedChange={(checked) => toggleUseCase(option, Boolean(checked))}
                        />
                        <span className="text-sm text-slate-100">{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.useCases ? <p className="portal-inline-error">{errors.useCases}</p> : null}

                  <div className="portal-actions">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft data-icon="inline-start" />
                      Back
                    </Button>
                    <Button onClick={handleStepTwo}>
                      Generate API Key
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="space-y-4">
                  <div className="portal-code-block">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="flex items-center gap-2">
                        <KeyRound className="text-cyan-200" />
                        {apiKeyState.key}
                      </p>
                      <Button size="sm" variant="outline" onClick={handleCopy}>
                        {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <p className="portal-note">Save this key. It will only be shown once.</p>

                  <pre className="portal-code-block">{sampleCurl}</pre>

                  <div className="portal-actions">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ArrowLeft data-icon="inline-start" />
                      Back
                    </Button>
                    <Button onClick={handleComplete}>
                      Continue to webhook setup
                      <ArrowRight data-icon="inline-end" />
                    </Button>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-4">
                  <div className="portal-field">
                    <Label htmlFor="webhook-url">Webhook URL (optional)</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://example.com/creditbridge/webhook"
                      value={formState.webhookUrl}
                      onChange={(event) =>
                        setFormState((previous) => ({
                          ...previous,
                          webhookUrl: event.target.value,
                        }))
                      }
                    />
                    {errors.webhookUrl ? <p className="portal-inline-error">{errors.webhookUrl}</p> : null}
                  </div>

                  <div className="portal-actions">
                    <Button
                      variant="outline"
                      onClick={() => {
                        toast.success("Test webhook delivered");
                      }}
                    >
                      <Send data-icon="inline-start" />
                      Test Webhook
                    </Button>
                    <Button asChild>
                      <Link href="/lender/dashboard">Go to lender dashboard</Link>
                    </Button>
                    <Button asChild variant="ghost">
                      <Link href="/lender/dashboard">Skip for now</Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
