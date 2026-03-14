"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any running interval
  function clearTicks() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  // When pathname changes, navigation is complete — finish and hide
  useEffect(() => {
    clearTicks();

    if (visible) {
      // Jump to 100%, then fade out and hide
      setProgress(100);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Intercept link clicks to start progress
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:")) return;
      if (anchor.getAttribute("target") === "_blank") return;
      if (href === pathname) return;

      // Start the progress bar
      clearTicks();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setVisible(true);
      setProgress(20);

      let current = 20;
      intervalRef.current = setInterval(() => {
        current += Math.random() * 12;
        if (current >= 90) {
          current = 90;
          clearTicks();
        }
        setProgress(current);
      }, 250);
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      clearTicks();
    };
  }, [pathname]);

  if (!visible) return null;

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
