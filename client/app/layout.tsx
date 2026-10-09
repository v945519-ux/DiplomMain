import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "Пиццерия Ронни | Пиццерия",
  description: "Интернет-магазин пиццерии с доставкой, корзиной и профилем.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}

