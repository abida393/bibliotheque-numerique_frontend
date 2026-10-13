"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }) {
  const [isDark, setIsDark] = useState(() => {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    return (
      savedTheme === "dark" ||
      (savedTheme === null && (root.classList.contains("dark") || prefersDark))
    );
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
  }, [isDark]);

  function toggle() {
    const root = document.documentElement;
    const next = !isDark;
    setIsDark(next);
    root.classList.toggle("dark", next);
    root.classList.toggle("light", !next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Activer le mode clair" : "Activer le mode sombre"}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors outline-none",
        "hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {isDark ? (
        <Sun className="size-4.5" aria-hidden="true" />
      ) : (
        <Moon className="size-4.5" aria-hidden="true" />
      )}
    </button>
  );
}
