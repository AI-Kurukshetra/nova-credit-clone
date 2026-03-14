"use client";

import { useEffect } from "react";
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
  /* ── Fix #2: Smooth scroll with offset for sticky header ── */
  useEffect(() => {
    function handleAnchorClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      const anchor = target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const id = anchor.getAttribute("href")?.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  /* ── Fix #3: Scroll-triggered reveal animations ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("landing-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".landing-scroll-reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing-shell">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 sm:flex">
            <a href="#how-it-works" className="landing-nav-link">
              How it works
            </a>
            <a href="#countries" className="landing-nav-link">
              Countries
            </a>
            <a href="#lenders" className="landing-nav-link">
              Lenders
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" className="landing-nav-link hidden sm:inline-flex">
              <Link href="/lender/onboard">Sign up</Link>
            </Button>
            <Button asChild className="landing-primary-btn">
              <Link href="/onboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="landing-hero-section relative overflow-hidden">
          {/* Decorative globe wireframe */}
          <div className="landing-globe" aria-hidden />
          <div className="landing-globe-glow" aria-hidden />
          {/* Floating particles */}
          <div className="landing-particle landing-particle-1" aria-hidden />
          <div className="landing-particle landing-particle-2" aria-hidden />
          <div className="landing-particle landing-particle-3" aria-hidden />

          <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-16 pt-20 text-center sm:px-8 lg:pb-24 lg:pt-32">
            <div className="landing-reveal">
              <h1 className="landing-headline">
                {["Translate", "your", "credit"].map((word, i) => (
                  <span key={word} className="hero-word" style={{ animationDelay: `${i * 100}ms` }}>
                    {word}
                  </span>
                ))}
                <br className="hidden sm:block" />
                {["history", "with"].map((word, i) => (
                  <span key={word} className="hero-word" style={{ animationDelay: `${(i + 3) * 100}ms` }}>
                    {word}
                  </span>
                ))}
                <span className="hero-word hero-brand" style={{ animationDelay: "500ms" }}>
                  CreditBridge
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
                Don&apos;t start from scratch. CreditBridge translates your foreign credit
                history so US lenders can see who you really are, financially.
              </p>
            </div>

            <div className="landing-reveal mt-10 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "120ms" }}>
              <Button asChild size="lg" className="landing-primary-btn landing-btn-pulse h-12 px-7 text-[0.9rem]">
                <Link href="/onboard">
                  Get Your Free Credit Report
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="landing-outline-btn h-12 px-7 text-[0.9rem]">
                <Link href="/lender/onboard">For Lenders</Link>
              </Button>
            </div>

            <div className="landing-reveal mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-x-6" style={{ animationDelay: "200ms" }}>
              {["No hard pull", "Bank-grade security", "Share in under 2 min"].map((item) => (
                <span key={item} className="landing-feature-pill">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Trust bar */}
          <div className="landing-reveal border-t border-slate-200/60 bg-white/50 backdrop-blur-sm" style={{ animationDelay: "280ms" }}>
            <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-6 px-5 py-8 sm:px-8">
              <p className="text-xs font-medium tracking-[0.2em] text-slate-400 uppercase">
                Trusted by Enterprise Lenders Globally
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-x-12 sm:gap-y-4">
                {[
                  { icon: Lock, label: "Bank-grade encryption" },
                  { icon: ShieldCheck, label: "Regulated & compliant" },
                  { icon: CheckCircle2, label: "50+ lenders" },
                  { icon: Globe2, label: "5 countries" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <span key={item.label} className="landing-trust-item flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-700">
                      <Icon className="size-4 text-slate-400" />
                      {item.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Dashboard Preview ── */}
        <section className="landing-scroll-reveal mx-auto w-full max-w-5xl px-5 py-20 sm:px-8">
          <div className="landing-preview-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="landing-live-dot" />
                <p className="text-xs font-semibold tracking-[0.15em] text-slate-400 uppercase">Consumer Dashboard</p>
              </div>
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">Good</Badge>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium tracking-wider text-slate-400">CreditBridge Score</p>
                <p className="landing-score-counter mt-1 text-4xl sm:text-6xl font-bold tracking-tighter text-slate-900" style={{ fontFamily: "var(--cb-font-display)" }}>742</p>
              </div>
              <p className="pb-2 text-sm text-slate-400">
                Equivalent to a <span className="font-semibold text-emerald-600">Good</span> US credit score
              </p>
            </div>
            <div className="mt-8 space-y-3">
              {[
                { label: "Payment History", value: 78, color: "from-indigo-500 to-indigo-400" },
                { label: "Credit Utilization", value: 81, color: "from-indigo-500 to-cyan-400" },
                { label: "Credit Age", value: 64, color: "from-cyan-500 to-cyan-400" },
                { label: "Account Mix", value: 70, color: "from-cyan-500 to-emerald-400" },
                { label: "Recent Inquiries", value: 68, color: "from-emerald-500 to-emerald-400" },
              ].map((bar) => (
                <div key={bar.label} className="landing-bar-row space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-500">{bar.label}</span>
                    <span className="font-semibold text-slate-700">{bar.value}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={`landing-bar-fill h-2 rounded-full bg-gradient-to-r ${bar.color}`}
                      style={{ "--bar-width": `${bar.value}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="landing-light-section">
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
            <div className="landing-scroll-reveal text-center">
              <Badge className="landing-section-badge">Process</Badge>
              <h2 className="landing-section-title mt-4">
                How It Works
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500">
                A short path from foreign bureau data to a US-ready lending narrative.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3">
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
                  <Card key={item.title} className="landing-step-card landing-scroll-reveal" style={{ "--reveal-delay": `${index * 120}ms` } as React.CSSProperties}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-4 text-lg text-slate-900">
                        <span className="landing-step-icon">
                          <Icon className="size-5" />
                        </span>
                        <span className="landing-step-num">Step {index + 1}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-[0.95rem] font-semibold leading-snug text-slate-800">{item.title}</p>
                      <p className="text-sm leading-relaxed text-slate-500">{item.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Countries ── */}
        <section id="countries" className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
          <div className="landing-scroll-reveal">
            <Badge className="landing-section-badge">Coverage</Badge>
            <h2 className="landing-section-title mt-4">
              Start your US financial life in minutes
            </h2>
            <p className="mt-4 max-w-2xl text-base text-slate-500">
              Each profile is normalized using bureau-specific logic, then surfaced in a format US lenders can act on immediately.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SUPPORTED_COUNTRIES.map((country, index) => (
              <Card
                key={country.code}
                className="landing-country-card landing-scroll-reveal"
                style={{ "--reveal-delay": `${index * 80}ms` } as React.CSSProperties}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-3xl leading-none">{country.flag}</span>
                    <Badge className="border-indigo-200 bg-indigo-50 text-[0.65rem] font-bold tracking-wider text-indigo-600 uppercase">
                      Mapped
                    </Badge>
                  </div>
                  <div className="mt-5 space-y-1.5">
                    <p className="text-base font-semibold text-slate-900">
                      {country.name}
                    </p>
                    <p className="text-xs font-semibold tracking-[0.1em] text-indigo-500 uppercase">{country.bureau}</p>
                    <p className="text-[0.7rem] font-medium tracking-wider text-slate-400 uppercase">
                      US-ready translation
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="landing-light-section">
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
            <div className="landing-scroll-reveal text-center">
              <Badge className="landing-section-badge">Proof</Badge>
              <h2 className="landing-section-title mt-4">
                What immigrants say
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-base text-slate-500">
                The value is immediate when a lender can read the full picture instead of a blank file.
              </p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={testimonial.name} className="landing-testimonial-card landing-scroll-reveal" style={{ "--reveal-delay": `${index * 100}ms` } as React.CSSProperties}>
                  <CardContent className="flex h-full flex-col justify-between p-7">
                    <div>
                      <span className="landing-quote-mark" aria-hidden>&ldquo;</span>
                      <p className="mt-3 text-[0.95rem] leading-relaxed text-slate-600">
                        {testimonial.quote}
                      </p>
                    </div>
                    <div className="mt-6">
                      <Separator className="mb-5 bg-slate-200" />
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{testimonial.name}</p>
                          <p className="text-xs text-slate-400">{testimonial.country}</p>
                        </div>
                        <p className="max-w-[10rem] text-right text-[0.7rem] font-medium leading-snug text-emerald-600">
                          {testimonial.outcome}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ── Lender CTA ── */}
        <section id="lenders" className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8">
          <Card className="landing-lender-cta landing-scroll-reveal">
            <CardContent className="grid gap-10 p-8 sm:p-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              <div className="space-y-4">
                <Badge className="landing-section-badge">For Lenders</Badge>
                <h2 className="landing-section-title leading-[0.95]">
                  Reduce risk.
                  <br />
                  Approve more.
                </h2>
                <p className="max-w-lg text-sm leading-relaxed text-slate-500">
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
                  <p key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    {item}
                  </p>
                ))}
                <Button asChild className="landing-primary-btn mt-4 w-full sm:w-auto">
                  <Link href="/lender/onboard">
                    Request API Access
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-slate-400">
              Crafted with care by <span className="font-semibold text-slate-500">Bacancy Technology</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/onboard" className="landing-footer-link">
              Get Started
            </Link>
            <Link href="/lender/onboard" className="landing-footer-link">
              Lender Portal
            </Link>
            <Link href="/privacy" className="landing-footer-link">
              Privacy Policy
            </Link>
            <Link href="/terms" className="landing-footer-link">
              Terms
            </Link>
            <Banknote className="size-4 text-slate-300" />
          </div>
        </div>
      </footer>
    </div>
  );
}
