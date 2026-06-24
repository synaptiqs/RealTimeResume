"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@/components/ui/icons";

type Mode = "light" | "dark";

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode | null>(null);

  useEffect(() => {
    setMode(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  function set(next: Mode) {
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* ignore */
    }
    setMode(next);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => set("light")}
        aria-label="Light theme"
        className={`flex h-9 w-9 items-center justify-center rounded-[10px] border border-border ${
          mode === "light" ? "bg-accent-bg text-accent" : "text-muted"
        }`}
      >
        <SunIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => set("dark")}
        aria-label="Dark theme"
        className={`flex h-9 w-9 items-center justify-center rounded-[10px] border border-border ${
          mode === "dark" ? "bg-accent-bg text-accent" : "text-muted"
        }`}
      >
        <MoonIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
