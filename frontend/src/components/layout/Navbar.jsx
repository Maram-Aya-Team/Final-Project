import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link href="/" className="navbarLogo">
        Found<span>It</span> JO
      </Link>

      <div className="navbarLinks">
        <Link href="/">الرئيسية</Link>
        <Link href="/search">البحث</Link>
        <Link href="/messages">الرسائل</Link>
        <Link href="/profile">الملف الشخصي</Link>
        <Link href="/admin">لوحة التحكم</Link>
      </div>

      <div className="navbarActions">
        <Link href="/login">Login</Link>
        <Link href="/register" className="registerBtn">
          Register
        </Link>
      </div>
    </nav>
  );
}