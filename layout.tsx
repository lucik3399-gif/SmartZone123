import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "SmartZone",
  description: "Production starter for SmartZone on Vercel + Supabase"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <header className="topbar">
          <div className="container nav">
            <Link href="/" className="brand">
              <div className="brand-badge">S</div>
              <div>
                <div>SmartZone</div>
                <small className="muted">Vercel + Supabase</small>
              </div>
            </Link>
            <nav className="nav-links">
              <Link href="/">Каталог</Link>
              <Link href="/track">Статус замовлення</Link>
              <Link href="/admin/login">Адмінка</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
