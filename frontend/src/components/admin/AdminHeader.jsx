export default function AdminHeader({ title }) {
  return (
    <header className="adminHeader">
      <div>
        <h1>{title}</h1>
        <p>إدارة ومتابعة نشاط منصة الموجودات والمفقودات</p>
      </div>
    </header>
  );
}