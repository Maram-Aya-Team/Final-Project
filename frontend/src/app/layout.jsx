import "./globals.css";
import "../styles/components.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "FoundIt JO",
  description: "Lost and Found Platform",
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