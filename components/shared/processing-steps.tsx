"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { CheckCircle2, LoaderCircle, Orbit } from "lucide-react";

interface ProcessingStepsProps {
  countryLabel: string;
}

export function ProcessingSteps({ countryLabel }: ProcessingStepsProps): React.JSX.Element {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  const steps = useMemo(
    () => [
      "Securely uploading your documents...",
      `Connecting to ${countryLabel} credit bureau...`,
      "Translating your credit history...",
      "Running risk assessment...",
      "Your CreditBridge score is ready!",
    ],
    [countryLabel],
  );

  useEffect(() => {
    if (activeStep >= steps.length) {
      const timer = setTimeout(() => router.push("/dashboard"), 500);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setActiveStep((previous) => previous + 1);
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeStep, router, steps.length]);

  return (
    <div className="portal-processing-shell">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="landing-icon-badge">
            <Orbit className="text-indigo-500" />
          </span>
          <div>
            <p className="portal-kicker">Translation In Progress</p>
            <h2 className="portal-subtitle">We are preparing your score</h2>
          </div>
        </div>
        <p className="portal-copy text-sm">
          Your documents are being normalized into a US-ready lending profile. This demo simulates
          the cross-border translation pipeline end to end.
        </p>
        <div className="portal-pill-note">Redirecting to your dashboard as soon as the final signal is ready.</div>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const complete = index < activeStep;
          const current = index === activeStep;

          return (
            <div
              key={step}
              className={`portal-processing-step${current ? " is-current" : ""}${complete ? " is-complete" : ""}`}
            >
              <span className="portal-processing-dot">
                {complete ? (
                  <CheckCircle2 className="text-emerald-600" />
                ) : current ? (
                  <LoaderCircle className="animate-spin text-indigo-500" />
                ) : (
                  <span className="size-2 rounded-full bg-slate-400/50" />
                )}
              </span>
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
