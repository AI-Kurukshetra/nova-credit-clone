"use client";

import Link from "next/link";

import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ClipboardCheck,
  Globe2,
  Lock,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SUPPORTED_COUNTRIES } from "@/lib/constants";

const testimonials = [
  {
    quote:
      "I moved from Bengaluru and got approved for my apartment rental in 2 days after sharing my CreditBridge profile.",
    name: "Priya Sharma",
    country: "India",
    outcome: "Approved for apartment rental in 2 days",
  },
  {
    quote:
      "My UK credit history finally counted. I received an auto loan offer without a co-signer in my first week in the US.",
    name: "James Mitchell",
    country: "United Kingdom",
    outcome: "Auto loan approved without co-signer",
  },
  {
    quote:
      "I arrived from Mexico and qualified for my first US credit card in month one. Huge confidence boost.",
    name: "Carlos Mendoza",
    country: "Mexico",
    outcome: "Qualified for a credit card in first month",
  },
];

export default function HomePage() {
  return (
    <div className="landing-shell">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-[#04102a]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo className="text-slate-50" />
          <div className="hidden items-center gap-6 text-sm sm:flex">
            <Link href="#how-it-works" className="landing-header-link">
              How it works
            </Link>
            <Link href="#countries" className="landing-header-link">
              Countries
            </Link>
            <Link href="#lenders" className="landing-header-link">
              Lenders
            </Link>
          </div>
          <Button asChild className="landing-outline-btn hidden sm:inline-flex">
            <Link href="/lender/onboard">For Lenders</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="landing-hero relative overflow-hidden border-b border-white/15">
          <div className="landing-spotlight" aria-hidden />
          <div className="landing-orb landing-orb-primary" aria-hidden />
          <div className="landing-orb landing-orb-secondary" aria-hidden />
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
            <div className="landing-reveal relative z-10 space-y-8">
              <Badge className="landing-signal-badge">Cross-Border Credit Intelligence</Badge>
              <div className="space-y-4">
                <h1 className="landing-display text-5xl leading-[0.95] text-white sm:text-7xl">
                  Your credit history travels with you.
                </h1>
                <p className="landing-hero-copy max-w-xl text-lg">
                  Don&apos;t start from scratch. CreditBridge translates your foreign credit
                  history so US lenders can see who you really are, financially.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" className="landing-cta-btn">
                  <Link href="/onboard">Get Your Free Credit Report</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="landing-outline-btn">
                  <Link href="/lender/onboard">For Lenders</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {["No hard pull", "Bank-grade security", "Share in under 2 min"].map((item) => (
                  <span key={item} className="landing-stat-pill">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="landing-reveal relative z-10" style={{ animationDelay: "120ms" }}>
              <div className="landing-panel p-5">
                <div className="landing-card landing-dashboard-card space-y-4 rounded-xl p-5">
                  <p className="landing-eyebrow">Consumer Dashboard</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="landing-subtle-copy text-sm">CreditBridge Score</p>
                      <p className="landing-data-metric text-5xl text-emerald-300">742</p>
                    </div>
                    <Badge className="landing-tier-badge">Good</Badge>
                  </div>
                  <div className="space-y-2">
                    {[78, 81, 64, 70, 68].map((value, index) => (
                      <div key={index} className="h-2 w-full rounded-full bg-slate-900/70">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="landing-subtle-copy text-xs">
                    Equivalent to a Good credit score in the US
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <div className="landing-section-frame">
            <p className="landing-eyebrow">Process</p>
            <h2 className="landing-display text-4xl text-white sm:text-5xl">
              How It Works
            </h2>
            <p className="landing-section-copy">
              A short path from foreign bureau data to a US-ready lending narrative.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Upload your foreign credit documents",
                description: "Passport, credit report, and supporting financial documents in minutes.",
                icon: Upload,
              },
              {
                title: "We translate your credit history into US format",
                description: "Country-specific models normalize bureau data into US lending context.",
                icon: Globe2,
              },
              {
                title: "Share your CreditBridge score with any US lender instantly",
                description: "Generate compliance-ready reports and secure lender share links.",
                icon: ClipboardCheck,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="landing-card landing-reveal" style={{ animationDelay: `${index * 80}ms` }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-lg text-white">
                      <span className="landing-icon-badge">
                        <Icon />
                      </span>
                      Step {index + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium text-slate-50">{item.title}</p>
                    <p className="landing-body-copy text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="countries" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="landing-section-frame">
            <p className="landing-eyebrow">Coverage</p>
            <h2 className="landing-display text-4xl text-white sm:text-5xl">
              Start your US financial life in minutes
            </h2>
            <p className="landing-section-copy">
              Each profile is normalized using bureau-specific logic, then surfaced in a format US lenders can act on immediately.
            </p>
          </div>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SUPPORTED_COUNTRIES.map((country, index) => (
              <Card
                key={country.code}
                className="landing-card landing-country-card landing-reveal"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="landing-country-mark" aria-hidden>
                      <span>{country.code}</span>
                    </div>
                    <span className="landing-country-code">Mapped</span>
                  </div>
                  <div className="mt-6 space-y-2">
                    <p className="text-lg font-semibold tracking-[0.01em] text-white">
                      {country.name}
                    </p>
                    <p className="landing-country-bureau">{country.bureau}</p>
                    <p className="landing-country-caption">
                      US-ready translation profile
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { title: "Bank-grade encryption", icon: Lock },
              { title: "Regulated & compliant", icon: ShieldCheck },
              { title: "Trusted by 50+ lenders", icon: CheckCircle2 },
              { title: "5 countries supported", icon: Globe2 },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="landing-card landing-trust-card landing-reveal"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <CardContent className="flex items-center gap-3 p-5 text-sm font-medium text-slate-50">
                    <span className="landing-icon-badge landing-icon-badge-sm">
                      <Icon />
                    </span>
                    {item.title}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
          <div className="landing-section-frame">
            <p className="landing-eyebrow">Proof</p>
            <h2 className="landing-display text-4xl text-white sm:text-5xl">
              What immigrants say
            </h2>
            <p className="landing-section-copy">
              The value is immediate when a lender can read the full picture instead of a blank file.
            </p>
          </div>
          <div className="mt-7 grid gap-4 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="landing-card landing-reveal" style={{ animationDelay: `${index * 85}ms` }}>
                <CardContent className="space-y-4 p-6">
                  <p className="landing-testimonial-copy text-sm leading-relaxed">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <Separator className="bg-white/15" />
                  <div>
                    <p className="font-medium text-white">{testimonial.name}</p>
                    <p className="landing-subtle-copy text-xs">{testimonial.country}</p>
                    <p className="mt-2 text-xs text-cyan-50">{testimonial.outcome}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="lenders" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
          <Card className="landing-panel landing-reveal border-cyan-200/30 bg-gradient-to-r from-[#0a1735] via-[#0d2148] to-[#113060] p-0" style={{ animationDelay: "140ms" }}>
            <CardContent className="grid gap-8 p-8 lg:grid-cols-[1.3fr_1fr]">
              <div className="space-y-3">
                <h2 className="landing-display text-4xl leading-none text-white sm:text-5xl">
                  Are you a lender? Reduce risk. Approve more.
                </h2>
                <p className="landing-body-copy text-sm">
                  Access verified cross-border credit data, REST API integration,
                  compliance-ready reports, and real-time webhook notifications.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  "Access verified cross-border credit data",
                  "REST API integration",
                  "Compliance-ready reports",
                  "Real-time webhook notifications",
                ].map((item) => (
                  <p key={item} className="landing-list-check text-sm text-slate-50">
                    <CheckCircle2 className="text-emerald-300" />
                    {item}
                  </p>
                ))}
                <Button asChild className="landing-cta-btn mt-2 w-full sm:w-auto">
                  <Link href="/lender/onboard">
                    Request API Access
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-white/15">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-slate-100/90 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Logo className="text-slate-50" />
            <p className="landing-subtle-copy mt-2 text-xs">Powered by Bacancy Technology</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/onboard" className="landing-header-link">
              Get Started
            </Link>
            <Link href="/lender/onboard" className="landing-header-link">
              Lender Portal
            </Link>
            <Link href="/privacy" className="landing-header-link">
              Privacy Policy
            </Link>
            <Link href="/terms" className="landing-header-link">
              Terms
            </Link>
            <Banknote className="text-cyan-200" />
          </div>
        </div>
      </footer>
    </div>
  );
}
