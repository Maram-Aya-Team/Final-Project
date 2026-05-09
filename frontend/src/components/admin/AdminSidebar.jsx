import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="adminSidebar">
      <h2 className="adminLogo">
        Found<span>It</span> JO
      </h2>

      <nav className="adminNav">
        <Link href="/admin">لوحة التحكم</Link>
        <Link href="/admin/reports">البلاغات</Link>
        <Link href="/admin/fraud">كشف الاحتيال</Link>
        <Link href="/admin/users">إدارة المستخدمين</Link>
        <Link href="/admin/posts">إدارة المنشورات</Link>
      </nav>
    </aside>
  );
}