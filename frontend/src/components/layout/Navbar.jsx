"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

import {
  House,
  Map,
  Bell,
  MessageCircle,
  Search,
} from "lucide-react";

const links = [
  {
    href: "/",
    label: "الرئيسية",
    icon: <House size={18} />,
  },
  {
    href: "/map",
    label: "الخريطة",
    icon: <Map size={18} />,
  },
  {
    href: "/notifications",
    label: "الإشعارات",
    icon: <Bell size={18} />,
  },
  {
    href: "/messages",
    label: "الرسائل",
    icon: <MessageCircle size={18} />,
  },
  {
    href: "/search",
    label: "البحث",
    icon: <Search size={18} />,
  },
];

export default function Navbar() {

  const pathname = usePathname();

  const {
    isAuthenticated,
    logout,
  } = useAuth();

  return (

    <header className="navbarWrapper">

      <nav className="navbar shell">

        {/* LOGO */}

        <Link
          href="/"
          className="navbarBrand"
        >
          <span className="brandDot"></span>

          FoundIt JO
        </Link>

        {/* LINKS */}

        <div className="navbarLinks">

          {links.map((link) => (

            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "navLink active"
                  : "navLink"
              }
            >

              {link.icon}

              <span>
                {link.label}
              </span>

            </Link>

          ))}

        </div>

        {/* ACTIONS */}

        <div className="navbarActions">

          {isAuthenticated ? (

            <button
              className="btn btnOutline"
              onClick={logout}
            >
              تسجيل الخروج
            </button>

          ) : (

            <>

              <Link
                href="/login"
                className="btn btnOutline"
              >
                تسجيل الدخول
              </Link>

              <Link
                href="/register"
                className="btn btnPrimary"
              >
                إنشاء حساب
              </Link>

            </>

          )}

        </div>

      </nav>

    </header>
  );
}