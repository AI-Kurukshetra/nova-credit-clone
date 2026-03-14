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
        <header className="landing-panel landing-reveal relative overflow-hidden p-6 sm:p-8">
          <div className="landing-spotlight" aria-hidden />
          <div className="landing-orb landing-orb-primary" aria-hidden />
          <div className="landing-orb landing-orb-secondary" aria-hidden />
          <div className="relative z-10 flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Logo className="text-slate-50" />
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="outline" className="landing-outline-btn">
                  <Link href="/">
                    <ArrowLeft />
                    Back to Home
                  </Link>
                </Button>
                <Button asChild className="landing-cta-btn">
                  <Link href={siblingHref}>
                    {siblingLabel}
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start">
              <div className="space-y-5">
                <Badge className="landing-signal-badge w-fit">{document.label}</Badge>
                <div className="space-y-3">
                  <h1 className="landing-display max-w-4xl text-4xl text-white sm:text-6xl">
                    {document.title}
                  </h1>
                  <p className="landing-body-copy max-w-3xl text-base sm:text-lg">
                    {document.description}
                  </p>
                </div>
                <p className="landing-subtle-copy text-sm">
                  Last updated {document.lastUpdated}. This page contains placeholder
                  legal language for the current demo build.
                </p>
              </div>

              <Card className="landing-card border-cyan-200/20 bg-slate-950/35">
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-center gap-3">
                    <span className="landing-icon-badge">
                      <ShieldCheck />
                    </span>
                    <div>
                      <p className="landing-eyebrow">Snapshot</p>
                      <p className="text-base font-semibold text-slate-50">
                        Key points at a glance
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {document.highlights.map((highlight) => (
                      <p key={highlight} className="landing-list-check text-sm text-slate-50">
                        <FileText className="text-cyan-200" />
                        {highlight}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </header>

        <section className="grid gap-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
          <aside
            className="landing-panel landing-reveal h-fit p-5"
            style={{ animationDelay: "80ms" }}
          >
            <p className="landing-eyebrow">On this page</p>
            <nav className="mt-4 space-y-3">
              {document.sections.map((section) => {
                const anchorId = section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

                return (
                  <Link
                    key={section.title}
                    href={`#${anchorId}`}
                    className="landing-header-link block"
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
                  className="landing-card landing-reveal border-white/10 bg-slate-950/28"
                  style={{ animationDelay: `${index * 70 + 120}ms` }}
                >
                  <CardContent className="space-y-4 p-6 sm:p-7">
                    <div className="space-y-2">
                      <p className="landing-eyebrow">{document.label}</p>
                      <h2 className="landing-display text-3xl text-white sm:text-4xl">
                        {section.title}
                      </h2>
                    </div>
                    <Separator className="bg-white/10" />
                    <div className="space-y-4">
                      {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="landing-body-copy text-sm sm:text-base">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    {section.bullets ? (
                      <div className="grid gap-3 pt-1">
                        {section.bullets.map((bullet) => (
                          <p key={bullet} className="landing-list-check text-sm text-slate-50">
                            <ShieldCheck className="text-emerald-300" />
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
