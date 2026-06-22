import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "EVRS - EV Real Range & Reliability Global Tracker",
  description: "Worldwide Electric Vehicle data collection and visualization system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap" rel="stylesheet" />
        <style>{`
          :root {
            --font-geist-sans: 'Geist', sans-serif;
            --font-geist-mono: 'Geist Mono', monospace;
          }
          body {
            font-family: var(--font-geist-sans);
          }
        `}</style>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9481255472542085" crossOrigin="anonymous"></script>
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}