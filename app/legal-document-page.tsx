import Link from "next/link";
import type { JSX } from "react";

import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { LegalDocument } from "@/lib/legal-content";

type LegalDocumentPageProps = {
  document: LegalDocument;
  siblingHref: string;
  siblingLabel: string;
};

export function LegalDocumentPage({
  document,
  siblingHref,
  siblingLabel,
}: LegalDocumentPageProps): JSX.Element {
  return (
    <div className="landing-shell">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        {/* ── Header ── */}
        <header className="landing-reveal rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Logo />
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="outline" className="landing-outline-btn">
                  <Link href="/">
                    <ArrowLeft />
                    Back to Home
                  </Link>
                </Button>
                <Button asChild className="landing-primary-btn">
                  <Link href={siblingHref}>
                    {siblingLabel}
                    <ArrowRight className="ml-1 size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start">
              <div className="space-y-4">
                <Badge className="landing-section-badge w-fit">{document.label}</Badge>
                <div className="space-y-3">
                  <h1 className="landing-section-title max-w-4xl text-4xl sm:text-5xl">
                    {document.title}
                  </h1>
                  <p className="max-w-3xl text-base leading-relaxed text-slate-500 sm:text-lg">
                    {document.description}
                  </p>
                </div>
                <p className="text-sm text-slate-400">
                  Last updated {document.lastUpdated}. This page contains placeholder
                  legal language for the current demo build.
                </p>
              </div>

              <Card className="border-slate-200 bg-slate-50">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-3">
                    <span className="landing-step-icon">
                      <ShieldCheck className="size-5" />
                    </span>
                    <div>
                      <p className="text-[0.7rem] font-bold tracking-[0.15em] text-indigo-500 uppercase">Snapshot</p>
                      <p className="text-base font-semibold text-slate-800">
                        Key points at a glance
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {document.highlights.map((highlight) => (
                      <p key={highlight} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                        <FileText className="size-4 shrink-0 text-indigo-400" />
                        {highlight}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <section className="grid gap-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="landing-reveal h-fit rounded-xl border border-slate-200 bg-white p-5 shadow-sm" style={{ animationDelay: "80ms" }}>
            <p className="text-[0.7rem] font-bold tracking-[0.15em] text-indigo-500 uppercase">On this page</p>
            <nav className="mt-4 space-y-3">
              {document.sections.map((section) => {
                const anchorId = section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                return (
                  <Link
                    key={section.title}
                    href={`#${anchorId}`}
                    className="landing-footer-link block text-sm"
                  >
                    {section.title}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-5">
            {document.sections.map((section, index) => {
              const anchorId = section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
              return (
                <Card
                  key={section.title}
                  id={anchorId}
                  className="landing-reveal border-slate-200 bg-white shadow-sm"
                  style={{ animationDelay: `${index * 70 + 120}ms` }}
                >
                  <CardContent className="space-y-4 p-6 sm:p-7">
                    <div className="space-y-2">
                      <p className="text-[0.7rem] font-bold tracking-[0.15em] text-indigo-500 uppercase">{document.label}</p>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl" style={{ fontFamily: "var(--cb-font-display)" }}>
                        {section.title}
                      </h2>
                    </div>
                    <Separator className="bg-slate-200" />
                    <div className="space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-sm leading-relaxed text-slate-600 sm:text-base">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets ? (
                      <div className="grid gap-3 pt-1">
                        {section.bullets.map((bullet) => (
                          <p key={bullet} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                            <ShieldCheck className="size-4 shrink-0 text-emerald-500" />
                            {bullet}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
