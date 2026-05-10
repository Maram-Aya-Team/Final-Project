import Link from "next/link";

export default function AdminSidebar() {
  return (
    <aside className="adminSidebar">
      <h2 className="adminLogo">FounIt JO</h2>

      <nav className="adminNav">
        <Link href="/admin">لوحة التحكم</Link>
        <Link href="/admin/reports">البلاغات</Link>
        <Link href="/admin/fraud">كشف الاحتيال</Link>
      </nav>
    </aside>
  );
}
