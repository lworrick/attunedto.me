"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconToday, IconHistory, IconTrends, IconSettings } from "./icons";

const items = [
  { href: "/today", label: "Today", Icon: IconToday },
  { href: "/history", label: "History", Icon: IconHistory },
  { href: "/trends", label: "Trends", Icon: IconTrends },
  { href: "/settings", label: "Settings", Icon: IconSettings },
];

export function TopBar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-10 flex items-center justify-center px-4 py-3 bg-attune-sand border-b border-attune-stone">
      <div className="w-full max-w-md lg:max-w-6xl flex items-center justify-between">
      <Link href="/today" className="text-lg font-semibold text-attune-ink">
        Attune
      </Link>
      <nav className="flex items-center gap-1">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== "/today" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 tap-target min-w-[56px] ${
                active ? "bg-attune-stone/80 text-attune-ink" : "text-attune-slate hover:bg-attune-stone/40"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
      </div>
    </header>
  );
}
