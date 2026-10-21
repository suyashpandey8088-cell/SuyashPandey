"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cx } from "@/lib/cx";

interface NavGroup {
  label: string;
  items: { label: string; href: string; exact?: boolean; badge?: number }[];
}

export default function AdminNav({ newFeedback = 0 }: { newFeedback?: number }) {
  const pathname = usePathname();

  const groups: NavGroup[] = [
    {
      label: "Overview",
      items: [{ label: "Dashboard", href: "/admin", exact: true }],
    },
    {
      label: "Content",
      items: [
        { label: "Updates", href: "/admin/updates" },
        { label: "Manifesto", href: "/admin/manifesto" },
        { label: "Vision pillars", href: "/admin/vision" },
      ],
    },
    {
      label: "Campaign",
      items: [
        { label: "Events", href: "/admin/events" },
        { label: "Progress board", href: "/admin/progress" },
        { label: "Student voice", href: "/admin/feedback", badge: newFeedback },
      ],
    },
    {
      label: "Configuration",
      items: [
        { label: "Candidate profile", href: "/admin/profile" },
        { label: "Website settings", href: "/admin/settings" },
        { label: "Account", href: "/admin/account" },
      ],
    },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Campaign admin" className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[0.56rem] uppercase tracking-[0.2em] text-admin-muted">
            {group.label}
          </p>
          <ul className="mt-2 grid gap-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cx(
                      "flex items-center justify-between gap-2 rounded-sm px-3 py-2 text-[0.84rem] transition-colors",
                      active
                        ? "bg-white text-plum shadow-[inset_2px_0_0_0_var(--color-purple)]"
                        : "text-charcoal/75 hover:bg-white/70 hover:text-plum",
                    )}
                  >
                    <span>{item.label}</span>
                    {item.badge ? (
                      <span className="rounded-full bg-purple px-1.5 py-0.5 text-[0.58rem] font-medium text-white">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
