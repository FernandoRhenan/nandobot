import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import styles from "@/app/layout.module.css";
import Breadcrumbs from "@/components/Breadcrumbs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_HEAD_NAME || "",
  description:
    "As melhores promoções, direto no seu WhatsApp. Entre no grupo e garanta os melhores preços.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body cz-shortcut-listen="true">
        <header className={styles.header}>
          <Breadcrumbs />
        </header>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--panel)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-mono)",
            },
          }}
        />
      </body>
    </html>
  );
}
