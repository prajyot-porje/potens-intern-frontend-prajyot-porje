import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Hind, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "../styles/globals.css";
import { LanguageProvider } from "../lib/i18n";
import { ThemeProvider } from "../lib/theme";
import { PageWrapper, Container } from "../components/primitives";

const grift = localFont({
  src: [
    {
      path: "../public/fonts/grift-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/grift-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-grift",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400", "500", "600"],
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
  description:
    "Premium multilingual civic complaint reporting app for Indian citizens. Report potholes, streetlights and more in under 60 seconds.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nagrik",
  },
  icons: {
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "application-name": "Nagrik",
    "msapplication-TileColor": "#0A0A0C",
    "msapplication-TileImage": "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0C" },
    { media: "(prefers-color-scheme: light)", color: "#FAFAFA" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
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
            {/* Screen Reader Announcement Live Region */}
            <div
              id="sr-announcement"
              className="sr-only"
              aria-live="polite"
              aria-atomic="true"
            ></div>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
