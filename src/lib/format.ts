/** Human "2h ago" / "Yesterday" style relative time. Pure. */
export function relativeTime(date: Date, now: Date = new Date()): string {
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Consecutive-day streak ending today (or yesterday) from activity dates. Pure. */
export function computeStreak(dates: Date[], now: Date = new Date()): number {
  if (dates.length === 0) return 0;
  const dayKeys = new Set(
    dates.map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()),
  );
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const cursor = startOfDay(now);
  // Allow the streak to count from today or, if nothing today yet, from yesterday.
  if (!dayKeys.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
    if (!dayKeys.has(cursor.getTime())) return 0;
  }
  let streak = 0;
  while (dayKeys.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
