import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import StoreProvider from "@/components/StoreProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CFB Dynasty Storyline Platform",
  description:
    "Enhance your College Football 26 dynasty with auto-generated storylines, news articles, College GameDay Pick'Em, podcasts, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StoreProvider>
          <Navbar />
          <main className="pt-16 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
          <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
            <p>CFB Dynasty Storyline Platform &copy; {new Date().getFullYear()}</p>
            <p className="mt-1 text-xs">
              A quality-of-life companion for College Football 26 Dynasty Mode
            </p>
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
