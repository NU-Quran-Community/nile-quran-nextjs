import "./globals.css";
import { Tajawal, Lalezar } from "next/font/google";

const tajawl = Tajawal({
  weight: "500",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawl.className}`}>{children}</body>
    </html>
  );
}
