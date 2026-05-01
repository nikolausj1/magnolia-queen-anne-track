import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const SITE_URL = "https://magnoliaqueenannetrackandfield.com";
const SITE_DESCRIPTION =
  "Youth track and field in Magnolia and Queen Anne, Seattle. Two teams, one program. Ages 5–17.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Magnolia CC Youth Track & Field · Queen Anne Quicksters · Seattle",
    template: "%s · Magnolia & Queen Anne Track",
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  appleWebApp: {
    title: "Track & Field",
  },
  openGraph: {
    type: "website",
    siteName: "Magnolia & Queen Anne Youth Track and Field",
    title: "Magnolia and Queen Anne Youth Track and Field",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    url: SITE_URL,
    // og image picked up automatically from app/opengraph-image.png
  },
  twitter: {
    card: "summary_large_image",
    title: "Magnolia and Queen Anne Youth Track and Field",
    description: SITE_DESCRIPTION,
    // twitter image picked up automatically from app/twitter-image.png
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
