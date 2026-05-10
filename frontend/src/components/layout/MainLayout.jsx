import Navbar from "./Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="layoutRoot">
      <Navbar />
      <main className="shell pageWrap">{children}</main>
    </div>
  );
}
