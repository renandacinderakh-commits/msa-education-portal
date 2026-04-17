import type { Metadata, Viewport } from "next";
import "./globals.css";
import { seoConfig } from "@/lib/content";
import JsonLd from "@/components/JsonLd";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ThemeProvider } from "@/lib/ThemeContext";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#f0f9ff",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://msa-education.vercel.app"),
  verification: {
    google: "DznGo2X5OXScNFlo6rggP-wPCNwhpLkxG9jZ2MqO9UA",
  },
  title: {
    default: seoConfig.defaultTitle,
    template: `%s | ${seoConfig.siteName}`,
  },
  description: seoConfig.defaultDescription,
  keywords: seoConfig.keywords,
  authors: [{ name: seoConfig.siteName }],
  creator: seoConfig.siteName,
  publisher: seoConfig.siteName,
  category: "Education",
  formatDetection: {
    telephone: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: seoConfig.siteName,
  },
  alternates: {
    canonical: "https://msa-education.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: seoConfig.locale,
    siteName: seoConfig.siteName,
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    url: "https://msa-education.vercel.app",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: seoConfig.siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoConfig.defaultTitle,
    description: seoConfig.defaultDescription,
    images: ["/images/og-image.jpg"],
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
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap"
          rel="stylesheet"
        />
        <JsonLd />
      </head>
      <body className="antialiased pb-[env(safe-area-inset-bottom,0px)]">
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

