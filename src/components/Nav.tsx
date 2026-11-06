"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChart, IconHome, IconList, IconUser } from "@/components/icons";

const ITEMS = [
  { href: "/", label: "ภาพรวม", short: "หน้าหลัก", Icon: IconHome },
  { href: "/transactions", label: "รายการ", short: "รายการ", Icon: IconList },
  { href: "/stats", label: "สถิติ", short: "สถิติ", Icon: IconChart },
  { href: "/account", label: "บัญชี", short: "บัญชี", Icon: IconUser },
];

function useActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === "/" ? pathname === "/" || pathname === "/add" : pathname.startsWith(href);
}

/** เมนูบนสำหรับจอใหญ่ */
export function TopNav() {
  const isActive = useActive();
  return (
    <nav className="pillnav topnav" aria-label="เมนูหลัก">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** เมนูล่างสำหรับมือถือ */
export function BottomNav() {
  const isActive = useActive();
  return (
    <nav className="bottomnav" aria-label="เมนูหลัก">
      {ITEMS.map(({ href, short, Icon }) => (
        <Link key={href} href={href} aria-current={isActive(href) ? "page" : undefined}>
          <Icon size={22} />
          <span>{short}</span>
        </Link>
      ))}
    </nav>
  );
}
