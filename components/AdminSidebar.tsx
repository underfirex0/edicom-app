"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/candidates", label: "Candidats" },
  { href: "/admin/interviews", label: "Entretiens" },
  { href: "/admin/invite", label: "Inviter" },
  { href: "/admin/settings", label: "Réglages" },
];

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname();
  return (
    <aside className="w-[236px] shrink-0 border-r border-line bg-paper flex flex-col h-screen sticky top-0">
      <div className="px-6 pt-7 pb-6">
        <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-copper">EDICOM</div>
        <div className="font-display text-[15px] font-semibold mt-0.5">Qualification B2B</div>
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "focus-ring block rounded-xl px-3.5 py-2.5 text-[14px] font-medium transition-colors " +
                (active ? "bg-white shadow-soft text-ink" : "text-ink/60 hover:bg-white/60 hover:text-ink")
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-5 border-t border-line">
        <div className="text-[12.5px] text-ink/70 mb-2 truncate">{adminName}</div>
        <form action={logoutAction}>
          <button className="focus-ring font-mono text-[12px] text-muted hover:text-coral">Se déconnecter →</button>
        </form>
      </div>
    </aside>
  );
}
