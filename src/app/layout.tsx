import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.neovolt.app"),
  title: {
    default: "EVRS | EV Real Range & Reliability Global Tracker by NeoVolt-PT",
    template: "%s | EVRS by NeoVolt-PT",
  },
  description:
    "Compare real-world electric vehicle range, battery degradation, NHTSA safety complaints, and mechanical reliability with the 0–100 EVRS Global Race Index.",
  keywords: [
    "EV real range",
    "electric vehicle reliability",
    "autonomia real carros elétricos",
    "fiabilidade veículos elétricos",
    "Tesla real range",
    "Hyundai Ioniq 5 range",
    "BYD reliability",
    "EV battery issues",
    "NHTSA EV complaints",
    "EVRS",
    "NeoVolt-PT",
  ],
  authors: [{ name: "NeoVolt-PT", url: "https://www.neovolt.app" }],
  creator: "NeoVolt-PT",
  publisher: "NeoVolt-PT",
  alternates: {
    canonical: "https://www.neovolt.app",
  },
  openGraph: {
    type: "website",
    locale: "pt_PT",
    alternateLocale: ["en_US"],
    url: "https://www.neovolt.app",
    siteName: "EVRS | by NeoVolt-PT",
    title: "EVRS | Electric Vehicle Real Range & 0–100 Reliability Index",
    description:
      "Search real-world autonomy, battery health, and reliability telemetry for Tesla, BYD, Hyundai, Volkswagen, Rivian, BMW, and 35+ EV brands.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EVRS | Electric Vehicle Real Range & 0–100 Reliability Index",
    description:
      "Search real-world autonomy, battery health, and reliability telemetry for 35+ EV brands.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLdSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "EVRS | by NeoVolt-PT",
      url: "https://www.neovolt.app",
      description:
        "Worldwide Electric Vehicle real-world range, battery, and mechanical reliability tracker.",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://www.neovolt.app/results?brand={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      name: "NeoVolt-PT",
      url: "https://www.neovolt.app",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
} & { children: React.ReactNode }>) {
  return (
    <html lang="pt" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
        />
        <GoogleAnalytics />
        <Providers>
          <Header />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
