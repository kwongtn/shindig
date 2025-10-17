import ThemeSelector from "@/components/theme-selector";
import { mdiRobotHappy } from '@mdi/js';
import Icon from '@mdi/react';
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
        <header className="navbar bg-base-100 p-4 sticky top-0 z-10">
          <div className="flex-1">
            <a className="btn btn-ghost text-xl">Shindig</a>
          </div>
          <div className="flex-none">
            <ThemeSelector />
          </div>
        </header>
        <main>
          {children}
        </main>

        <footer className="footer sm:footer-horizontal bg-neutral text-neutral-content items-center p-4">
          <aside className="grid-flow-col items-center">
            <Icon path={mdiRobotHappy} size={1} />
            <p>Vibe Coded with 💙 using <a href="https://github.com/QwenLM/qwen-code" target="_blank" className="link link-primary"> Qwen Code </a> by
              <a href="http://github.com/kwongtn" target="_blank" className="link link-primary"> KwongTN </a>
              & contributors, GNU AGPLv3</p>
          </aside>
          <nav className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
            <a>
              <svg
                width="36"
                height="36" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                fillRule="evenodd"
                clipRule="evenodd"
                className="fill-current"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
            </a>
          </nav>
        </footer>
      </body>
    </html>
  );
}
