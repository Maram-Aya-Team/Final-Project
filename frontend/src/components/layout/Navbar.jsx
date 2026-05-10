"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/map", label: "الخريطة" },
  { href: "/notifications", label: "الإشعارات" },
  { href: "/messages", label: "الرسائل" },
  { href: "/search", label: "البحث" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="navbar shell">
      <Link href="/" className="navbarBrand">
        FounIt JO
      </Link>

      <div className="navbarLinks">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : ""}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="navbarActions">
        {isAuthenticated ? (
          <button className="btn btn-outline" onClick={logout}>
            تسجيل الخروج
          </button>
        ) : (
          <>
            <Link href="/login" className="btn btn-outline">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="btn btn-primary">
              إنشاء حساب
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
