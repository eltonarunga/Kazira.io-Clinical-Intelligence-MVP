import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { CookieBanner } from "./components/CookieBanner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Kazira Clinical Intelligence",
    default: "Kazira Clinical Intelligence",
  },
  description: "Revenue intelligence for private dental clinics",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    title: "Kazira Clinical Intelligence",
    description: "Revenue intelligence for private dental clinics",
    url: "/",
    siteName: "Kazira",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kazira Clinical Intelligence",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kazira Clinical Intelligence",
    description: "Revenue intelligence for private dental clinics",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kazira Clinical Intelligence",
    "url": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "logo": `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/icon-512x512.png`,
    "description": "Revenue intelligence for private dental clinics",
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <CookieBanner />
      </body>
    </html>
  );
}
