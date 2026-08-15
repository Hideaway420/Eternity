import type { Metadata } from "next";
import "./globals.css";
import { WhatsAppFloatingButton } from "@/components/storefront/WhatsAppFloatingButton";

export const metadata: Metadata = {
  metadataBase: new URL("https://eternityproducts.online"),
  title: "Eternity Products Nepal | Official Ikonic Styling Tools & Luxury Spa Chairs",
  description:
    "Eternity Products is Nepal's authorized importer of Ikonic professional titanium hair straighteners, blow dryers 2500+, curling wands, luxury salon chairs, and pedicure spa stations. 100% genuine seal, 13% VAT inclusive pricing, 1-year replacement warranty, and open-box cash on delivery across Kathmandu Valley and nationwide Nepal.",
  keywords: [
    "Ikonic Nepal",
    "Ikonic Professional Nepal",
    "Titanium Hair Straightener Kathmandu",
    "Ikonic Hair Dryer 2500+ Nepal",
    "Curling Wand Nepal",
    "Luxury Salon Chair Kathmandu",
    "Pedicure Spa Chair Nepal",
    "Beauty Parlour Equipment Distributor Nepal",
    "Eternity Products Nepal",
    "eternityproducts.online",
    "Open-Box Cash on Delivery Nepal",
    "Ikonic Straightener Price Nepal",
  ],
  openGraph: {
    title: "Eternity Products Nepal | Official Ikonic Hair Tools & Salon Furniture",
    description:
      "Nepal's premier supplier of Ikonic titanium straighteners, blow dryers, curling wands, luxury hydraulic salon chairs (NPR 30k-40k range), and pedicure spa equipment. Open-box COD nationwide.",
    url: "https://eternityproducts.online",
    siteName: "Eternity Products Nepal",
    images: [
      {
        url: "https://www.ikonicworld.com/cdn/shop/files/8904231015937_1_702816a3-41c8-4c88-92b3-ab4c7779920f.jpg",
        width: 1200,
        height: 630,
        alt: "Ikonic Professional Hair Tools Nepal",
      },
    ],
    locale: "en_NP",
    type: "website",
  },
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
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
