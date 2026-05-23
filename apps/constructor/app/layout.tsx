import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EconomySim Constructor",
  description: "Developer constructor for EconomySim world data."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
