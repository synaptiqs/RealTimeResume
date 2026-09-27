"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  PlusCircleIcon,
  DocIcon,
  PersonIcon,
} from "@/components/ui/icons";

const TABS = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/log", label: "Log", Icon: PlusCircleIcon },
  { href: "/resume", label: "Resume", Icon: DocIcon },
  { href: "/profile", label: "Profile", Icon: PersonIcon },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex h-14 max-w-app items-stretch border-t border-border bg-surface backdrop-blur">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`tab-item ${active ? "tab-item-active" : ""}`}
          >
            <Icon className="h-[22px] w-[22px]" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
