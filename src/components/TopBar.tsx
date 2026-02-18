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
    <header className="bg-[var(--bone)] border-b border-[var(--dust)] sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/today"
            className="text-2xl text-[var(--clay)] hover:text-[var(--adobe)] transition-colors duration-200 font-canela"
          >
            Attune
          </Link>
          <nav className="hidden md:flex gap-2">
            {items.map(({ href, label, Icon }) => {
              const active = pathname === href || (href !== "/today" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center justify-center rounded-lg font-medium gap-2 text-sm px-3 py-1.5 transition-all duration-200 ${
                    active
                      ? "bg-[var(--clay)] text-[var(--bone)] hover:bg-[var(--adobe)] shadow-sm"
                      : "hover:bg-[var(--bone)] text-[var(--basalt)]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--bone)] border-t border-[var(--dust)] z-10 shadow-lg">
        <div className="grid grid-cols-4">
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== "/today" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center py-3 gap-1 transition-colors duration-200 tap-target ${
                  active ? "text-[var(--clay)]" : "text-[var(--dust)] hover:text-[var(--basalt)]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
