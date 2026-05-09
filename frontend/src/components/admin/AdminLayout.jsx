import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ title, children }) {
  return (
    <div className="adminLayout">
      <AdminSidebar />

      <div className="adminMain">
        <AdminHeader title={title} />
        <div className="adminContent">{children}</div>
      </div>
    </div>
  );
}