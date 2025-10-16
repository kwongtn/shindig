import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Shindig - Next.js Starter",
  description: "Modern Next.js starter with Tailwind CSS, DaisyUI and Sentry",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="navbar bg-base-100 p-4">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Shindig</a>
          </div>
          <div className="flex-none">
            {/* Theme Selector will be imported in page.tsx */}
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
