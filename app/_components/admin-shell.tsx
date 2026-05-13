"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { clearAdminToken, getAdminToken } from "../_lib/admin-auth";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/collections", label: "Categories" },
  { href: "/lehengas", label: "Lehengas" },
  { href: "/jewellery", label: "Jewellery" },
  { href: "/orders", label: "Orders" },
];

export function AdminShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const token = getAdminToken();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [router, token]);

  if (!token) {
    return (
      <main className="admin-loading-screen">
        <div className="admin-loading-card">
          <p>Opening the atelier dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="admin-brand-kicker">Lehenga</span>
          <h1>Admin Atelier</h1>
          <p>Rental catalog control for categories, lehengas, and jewellery.</p>
        </div>

        <nav className="admin-nav" aria-label="Admin navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "is-active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="admin-ghost-button"
          onClick={() => {
            clearAdminToken();
            router.replace("/login");
          }}
        >
          Logout
        </button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-eyebrow">{eyebrow}</span>
            <h2>{title}</h2>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
