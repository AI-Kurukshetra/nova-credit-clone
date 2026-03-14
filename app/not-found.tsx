"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="landing-shell flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-xl space-y-5 rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-500">
          <Compass />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold tracking-[0.15em] text-indigo-500 uppercase">Routing</p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900" style={{ fontFamily: "var(--cb-font-display)" }}>Page not found</h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-500">
          The page you are looking for does not exist or has moved.
        </p>
        <Button asChild className="landing-primary-btn">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
