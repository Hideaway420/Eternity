import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eternity Products Nepal | Professional Styling Tools & Salon Equipment",
  description:
    "Nepal's official distributor of Ikonic professional hair straighteners, dryers, curlers, and salon furniture. Guaranteed genuine with open-box cash on delivery.",
  keywords: [
    "Ikonic Nepal",
    "Hair Straighteners Kathmandu",
    "Professional Dryer Nepal",
    "Salon Furniture Kathmandu",
    "Ikonic Professional",
    "Eternity Products",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-surface text-on-surface antialiased min-h-screen flex flex-col selection:bg-gold-light selection:text-on-surface">
        {children}
      </body>
    </html>
  );
}
