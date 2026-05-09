import Navbar from "./Navbar";

export default function MainLayout({ children }) {
  return (
    <div className="layout">
      <Navbar />

      <main className="mainContent">
        {children}
      </main>
    </div>
  );
}