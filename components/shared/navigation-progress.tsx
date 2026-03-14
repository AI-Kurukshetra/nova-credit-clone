"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Reset when navigation completes
    setLoading(false);
    setProgress(100);

    const timeout = setTimeout(() => setProgress(0), 300);
    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  // Intercept link clicks to start progress
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) return;
      if (anchor.getAttribute("target") === "_blank") return;
      if (href === pathname) return;

      setLoading(true);
      setProgress(20);

      // Simulate progress ticks
      let current = 20;
      const interval = setInterval(() => {
        current += Math.random() * 15;
        if (current >= 90) {
          clearInterval(interval);
          current = 90;
        }
        setProgress(current);
      }, 200);

      // Cleanup on next navigation complete (handled by the pathname effect above)
      const cleanup = () => clearInterval(interval);
      window.addEventListener("beforeunload", cleanup, { once: true });
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading && progress === 0) return null;

  return (
    <div className="nav-progress-bar" aria-hidden>
      <div
        className="nav-progress-fill"
        style={{
          width: `${progress}%`,
          opacity: progress >= 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
