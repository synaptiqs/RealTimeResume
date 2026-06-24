"use client";

import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button
      onClick={signOut}
      className="w-full rounded-card border border-border bg-surface px-4 py-3 text-left text-sm font-medium text-danger"
    >
      Sign Out
    </button>
  );
}
