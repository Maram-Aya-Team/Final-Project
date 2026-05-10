import "./globals.css";
import "../styles/components.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "FounIt JO",
  description: "منصة FounIt JO",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
