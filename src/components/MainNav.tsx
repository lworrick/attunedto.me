"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/today", label: "Today" },
  { href: "/history", label: "History" },
  { href: "/trends", label: "Trends" },
  { href: "/settings", label: "Settings" },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="border-t border-attune-stone bg-attune-sand/95 backdrop-blur-sm safe-area-pb">
      <div className="flex">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== "/today" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 text-center py-3 text-sm tap-target ${active ? "text-attune-ink font-medium" : "text-attune-slate"}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
