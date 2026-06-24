"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Demo upgrade/downgrade (no payment processor yet — see /api/billing).
export default function PlanButton({
  action,
  className,
  children,
}: {
  action: "upgrade" | "downgrade";
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    try {
      const res = await fetch("/api/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button onClick={go} disabled={busy} className={className}>
      {busy ? "…" : children}
    </button>
  );
}
