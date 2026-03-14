"use client";

import Link from "next/link";
import { Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="landing-shell flex min-h-screen items-center justify-center px-4 text-slate-100">
      <div className="landing-panel landing-reveal w-full max-w-xl space-y-5 p-7 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-cyan-300/30 bg-cyan-400/10 text-cyan-100">
          <Compass />
        </div>
        <div className="space-y-2">
          <p className="landing-eyebrow">Routing</p>
          <h2 className="landing-display text-3xl text-white">Page not found</h2>
        </div>
        <p className="landing-body-copy text-sm">
          The page you are looking for does not exist or has moved.
        </p>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}

