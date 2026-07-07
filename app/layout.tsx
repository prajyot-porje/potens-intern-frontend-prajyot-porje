import type { Metadata } from "next";
import { Instrument_Sans, Hind, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "../styles/globals.css";
import { LanguageProvider } from "../lib/i18n";
import { ThemeProvider } from "../lib/theme";
import { PageWrapper, Container } from "../components/primitives";

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
  manifest: "/manifest.json", // Reference manifest for future PWA shell
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
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-bg transition-colors duration-300">
        <LanguageProvider>
          <ThemeProvider>
            <PageWrapper>
              <Container>
                {children}
              </Container>
            </PageWrapper>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
