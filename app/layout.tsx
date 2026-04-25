import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default:
      "Magnolia CC Youth Track & Field · Queen Anne Quicksters · Seattle",
    template: "%s · Magnolia & Queen Anne Track",
  },
  description:
    "Youth track and field in Magnolia and Queen Anne, Seattle. Two teams, one program. Ages 5–17.",
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
