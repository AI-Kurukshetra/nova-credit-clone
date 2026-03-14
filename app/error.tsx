"use client";

import { useEffect } from "react";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled UI error", { digest: error.digest ?? "unknown" });
  }, [error]);

  return (
    <html lang="en">
      <body className="landing-shell flex min-h-screen items-center justify-center px-4 text-slate-100">
        <div className="landing-panel landing-reveal w-full max-w-xl space-y-5 p-7 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-rose-300/30 bg-rose-500/10 text-rose-100">
            <AlertTriangle />
          </div>
          <div className="space-y-2">
            <p className="landing-eyebrow">System Error</p>
            <h2 className="landing-display text-3xl text-white">Something went wrong</h2>
          </div>
          <p className="landing-body-copy text-sm">
            We could not complete that request. Please retry the action or return to a stable route.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={reset}>Try again</Button>
            <Button asChild variant="outline" className="landing-outline-btn">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
