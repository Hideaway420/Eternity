import type { Metadata, Viewport } from "next";
import "./globals.css";
import { WhatsAppFloatingButton } from "@/components/storefront/WhatsAppFloatingButton";

export const viewport: Viewport = {
  themeColor: "#F8F3EC",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://eternityproducts.online"),
  title: {
    default: "Eternity Products Nepal | Official Ikonic Styling Tools & Luxury Spa Chairs",
    template: "%s | Eternity Products Nepal",
  },
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
  authors: [{ name: "Eternity Products Nepal", url: "https://eternityproducts.online" }],
  creator: "Eternity Products Nepal",
  publisher: "Eternity Products Nepal",
  category: "Beauty & Personal Care / Salon Equipment",
  alternates: {
    canonical: "https://eternityproducts.online",
    languages: {
      "en-NP": "https://eternityproducts.online",
      "ne-NP": "https://eternityproducts.online?lang=np",
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png" }],
  },
  verification: {
    google: "0ahB6Zbvm8IrToCcYC_CsFlziYMvb31S2a-VkEkXj0U",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Eternity Products Nepal | Official Ikonic Hair Tools & Salon Furniture",
    description:
      "Nepal's premier supplier of Ikonic titanium straighteners, blow dryers, curling wands, luxury hydraulic salon chairs (NPR 30k-40k range), and pedicure spa equipment. Open-box Cash on Delivery nationwide.",
    url: "https://eternityproducts.online",
    siteName: "Eternity Products Nepal",
    images: [
      {
        url: "https://eternityproducts.online/logo.png",
        width: 1200,
        height: 630,
        alt: "Eternity Products Nepal Official Logo",
      },
    ],
    locale: "en_NP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eternity Products Nepal | Official Ikonic Hair Tools & Salon Furniture",
    description: "Official authorized importer of Ikonic hair styling tools & Eternity luxury pedicure spa chairs in Nepal.",
    images: ["https://eternityproducts.online/logo.png"],
  },
  other: {
    "geo.region": "NP-P3",
    "geo.placename": "Kathmandu",
    "geo.position": "27.7172;85.3240",
    "ICBM": "27.7172, 85.3240",
  },
};

// JSON-LD Organization Schema for Google Search Logo & Knowledge Graph
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Eternity Products Nepal",
  legalName: "Eternity Products Importers & Distributors",
  url: "https://eternityproducts.online",
  logo: "https://eternityproducts.online/logo.png",
  image: "https://eternityproducts.online/logo_full_banner.jpg",
  telephone: "+977-9868089892",
  email: "sales@eternityproducts.com.np",
  address: {
    "@type": "PostalAddress",
    streetAddress: "New Road",
    addressLocality: "Kathmandu",
    addressRegion: "Bagmati",
    postalCode: "44600",
    addressCountry: "NP",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+977-9868089892",
    contactType: "customer service",
    areaServed: "NP",
    availableLanguage: ["English", "Nepali"],
  },
  sameAs: [
    "https://www.tiktok.com/@eternity.products",
    "https://wa.me/9779868089892",
  ],
};

// JSON-LD Website & Sitelinks Search Box Schema
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Eternity Products Nepal",
  url: "https://eternityproducts.online",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://eternityproducts.online/c/spa?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="google-site-verification" content="0ahB6Zbvm8IrToCcYC_CsFlziYMvb31S2a-VkEkXj0U" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-surface text-on-surface antialiased min-h-screen flex flex-col selection:bg-gold-light selection:text-on-surface">
        {children}
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
