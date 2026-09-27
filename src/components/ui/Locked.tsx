import Link from "next/link";
import { LockIcon } from "@/components/ui/icons";

/**
 * Pro-gated wrapper (PRD §5): renders the real content blurred behind a
 * translucent overlay with a centered lock + "PRO" label in the amber accent.
 * Tapping the overlay routes to the upgrade flow.
 */
export default function Locked({
  children,
  label = "Pro",
  href = "/profile#upgrade",
}: {
  children: React.ReactNode;
  label?: string;
  href?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-card">
      <div className="locked-blur" aria-hidden>
        {children}
      </div>
      <Link
        href={href}
        className="absolute inset-0 flex flex-col items-center justify-center gap-1 overlay-bg backdrop-blur-[1px]"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full lock-chip text-upgrade">
          <LockIcon className="h-4 w-4" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wide text-upgrade">
          {label}
        </span>
      </Link>
    </div>
  );
}
