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
      <body className="landing-shell flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600">
            <AlertTriangle />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold tracking-[0.15em] text-rose-500 uppercase">System Error</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900" style={{ fontFamily: "var(--cb-font-display)" }}>Something went wrong</h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            We could not complete that request. Please retry the action or return to a stable route.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={reset} className="landing-primary-btn">Try again</Button>
            <Button asChild variant="outline" className="landing-outline-btn">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
