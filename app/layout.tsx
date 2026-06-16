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
  metadataBase: new URL('https://aisistent.rs'),
  title: "AIsistent — Poslovni asistent",
  description:
    "Generator ugovora, poslovnih mejlova i HR dokumenata prilagođenih srpskom pravu.",
  icons: {
    icon: "/logo/favicon_64x64.ico",
    shortcut: "/logo/favicon_64x64.ico",
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AIsistent',
  description: 'AI generator pravnih dokumenata i poslovnih alata za srpske preduzetnike',
  url: 'https://aisistent.rs',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'RSD',
    description: 'Besplatan plan — 3 dokumenta mesečno',
  },
  inLanguage: 'sr',
  availableLanguage: 'Serbian',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
