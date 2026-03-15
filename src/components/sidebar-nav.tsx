"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Boxes, LifeBuoy, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/clientes", label: "Clientes", icon: Users2 },
  { href: "/soporte", label: "Soporte", icon: LifeBuoy },
  { href: "/productos", label: "Productos", icon: Boxes },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="sidebar-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn("sidebar-link", isActive && "sidebar-link--active")}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
