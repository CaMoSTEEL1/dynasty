import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CFB Dynasty Storyline Platform",
  description: "The ultimate QOL dynasty overhaul for CFB 26 — storylines, news, pick'em, podcasts, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
