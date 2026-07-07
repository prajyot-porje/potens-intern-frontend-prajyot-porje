import type { Metadata } from "next";
import { Instrument_Sans, Hind, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const grift = localFont({
  src: [
    {
      path: "../public/fonts/grift-semibold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/grift-bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-grift",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400", "500", "600", "700"],
});

const hind = Hind({
  subsets: ["devanagari", "latin"],
  variable: "--font-hind",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Nagrik",
  description: "Ultra-premium, neutral-only civic reporting PWA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${grift.variable} ${instrumentSans.variable} ${hind.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

