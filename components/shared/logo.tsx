import Link from "next/link";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  href?: string;
  compact?: boolean;
}

function BrandMark(): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className="relative z-10 size-7"
      fill="none"
    >
      {/* Bridge arch */}
      <path
        d="M8 28C8 20 13.5 14 20.5 14H23.5C27.6 14 31 17.4 31 21.5V28"
        stroke="url(#logo-arch)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Bridge deck */}
      <path
        d="M8 28H31"
        stroke="url(#logo-deck)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Upward arrow */}
      <path
        d="M15 22L20 16.5L25 22"
        stroke="#4338ca"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 17V28"
        stroke="#4338ca"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Accent dots */}
      <circle cx="11" cy="11" r="2.5" fill="#4338ca" fillOpacity="0.85" />
      <circle cx="29" cy="11" r="2.5" fill="#818cf8" fillOpacity="0.5" />
      <defs>
        <linearGradient id="logo-arch" x1="8" y1="14" x2="31" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338ca" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
        <linearGradient id="logo-deck" x1="8" y1="28" x2="31" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4338ca" />
          <stop offset="1" stopColor="#818cf8" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({ className, href = "/", compact = false }: LogoProps): React.JSX.Element {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label="CreditBridge"
    >
      <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5">
        <BrandMark />
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-[-0.03em]">
          <span className="text-slate-900">Credit</span><span className="text-indigo-600">Bridge</span>
        </span>
      )}
    </Link>
  );
}
