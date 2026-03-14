import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoodBubble",
  description:
    "A map-based emotional journaling platform — record feelings at locations and visualize your emotional landscape.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100`}
      >
        {/* Global Nav */}
        <nav className="sticky top-0 z-40 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-6 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <Link href="/" className="text-lg font-bold tracking-tight">
            🫧 MoodBubble
          </Link>
          <div className="flex gap-4 text-sm font-medium">
            <Link
              href="/map"
              className="hover:text-indigo-600 transition-colors"
            >
              Map
            </Link>
            <Link
              href="/insights"
              className="hover:text-indigo-600 transition-colors"
            >
              Insights
            </Link>
          </div>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
