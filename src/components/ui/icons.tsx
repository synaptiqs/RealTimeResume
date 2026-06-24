// Minimal 1.5px-stroke line icons (PRD §7.5). Inline to avoid a dependency.

type P = { className?: string };
const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  width: 22,
  height: 22,
};

export const HomeIcon = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </svg>
);

export const PlusCircleIcon = (p: P) => (
  <svg {...base} className={p.className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export const DocIcon = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M6 2h8l4 4v16H6z" />
    <path d="M14 2v4h4M9 13h6M9 17h6" />
  </svg>
);

export const PersonIcon = (p: P) => (
  <svg {...base} className={p.className}>
    <circle cx="12" cy="8" r="4" />
    <path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6" />
  </svg>
);

export const LockIcon = (p: P) => (
  <svg {...base} className={p.className}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const MicIcon = (p: P) => (
  <svg {...base} className={p.className}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);

export const ChevronRightIcon = (p: P) => (
  <svg {...base} className={p.className} width={18} height={18}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const ArrowRightIcon = (p: P) => (
  <svg {...base} className={p.className} width={18} height={18}>
    <path d="M4 12h16M14 6l6 6-6 6" />
  </svg>
);

export const SunIcon = (p: P) => (
  <svg {...base} className={p.className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" />
  </svg>
);

export const MoonIcon = (p: P) => (
  <svg {...base} className={p.className}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
  </svg>
);
