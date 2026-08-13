"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavTabs() {
  const pathname = usePathname();
  const tabs = [
    { href: "/", label: "PFP Frame" },
    { href: "/card", label: "Builder ID Card" },
  ];

  return (
    <header className="w-full flex flex-col items-center gap-4 pt-8 pb-4 px-4">
      <p className="text-xs tracking-[0.3em] text-[#FF0080] font-bold uppercase">HH Goa 2026</p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-center text-[#FEE101] drop-shadow-[3px_3px_0_#000]">
        Frame in Goa
      </h1>
      <nav className="flex gap-2 bg-[#FFFBE8]/10 rounded-full p-1 border border-[#FFFBE8]/15">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                active ? "bg-[#FEE101] text-[#0B6839]" : "text-[#FFFBE8]/70 hover:text-[#FFFBE8]"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
