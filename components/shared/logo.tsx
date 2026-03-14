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
      <path
        d="M9 27C9 20.3726 14.3726 15 21 15H24C28.4183 15 32 18.5817 32 23V27"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M9 27H31"
        stroke="#F8FAFC"
        strokeOpacity="0.9"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <path
        d="M15 21L20 16L25 21"
        stroke="#F8FAFC"
        strokeOpacity="0.94"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 16V28"
        stroke="#F8FAFC"
        strokeOpacity="0.94"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="10.5" cy="11.5" r="2.5" fill="#F8FAFC" fillOpacity="0.92" />
      <circle cx="29.5" cy="11.5" r="2.5" fill="#F8FAFC" fillOpacity="0.68" />
    </svg>
  );
}

export function Logo({ className, href = "/", compact = false }: LogoProps): React.JSX.Element {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 rounded-xl text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label="CreditBridge"
    >
      <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] border border-current/15 bg-[linear-gradient(145deg,rgba(14,165,233,0.22),rgba(37,99,235,0.12)_52%,rgba(16,185,129,0.22))] text-current shadow-[0_10px_24px_rgba(2,6,23,0.16)] transition-transform duration-200 group-hover:-translate-y-0.5">
        <span className="absolute inset-[1px] rounded-[1rem] bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.28),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
        <BrandMark />
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-[-0.04em] text-current">
          Credit<span className="opacity-80">Bridge</span>
        </span>
      )}
    </Link>
  );
}
