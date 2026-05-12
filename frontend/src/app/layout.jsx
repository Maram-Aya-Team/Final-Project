import "./globals.css";
import "../styles/components.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: {
    default: "FounIt JO",
    template: "%s | FounIt JO",
  },
  description: "منصة أردنية للمفقودات والموجودات مع خرائط وتواصل لحظي.",
  keywords: ["Lost and Found", "Jordan", "FounIT", "مفقودات", "موجودات"],
  openGraph: {
    title: "FounIt JO",
    description: "منصة أردنية للمفقودات والموجودات مع خرائط وتواصل لحظي.",
    type: "website",
  },
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
