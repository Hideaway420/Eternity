import type { Metadata, Viewport } from "next";
import "./globals.css";
import { WhatsAppFloatingButton } from "@/components/storefront/WhatsAppFloatingButton";
import { Analytics } from "@/components/analytics/Analytics";

export const viewport: Viewport = {
  themeColor: "#F8F3EC",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.eternityproducts.online"),
  applicationName: "Eternity Products",
  title: {
    default: "Eternity Products | Luxury Salon & Spa Furniture",
    template: "%s | Eternity Products",
  },
  description:
    "Luxury salon chairs and manicure & pedicure spa furniture in Nepal. Authorized importer, 1-year warranty, open-box cash on delivery across Kathmandu Valley.",
  keywords: [
    "Eternity Products",
    "Eternity Products Nepal",
    "Ikonic Nepal",
    "Ikonic Professional Nepal",
    "Titanium Hair Straightener Kathmandu",
    "Ikonic Hair Dryer 2500+ Nepal",
    "Curling Wand Nepal",
    "Luxury Salon Chair Kathmandu",
    "Pedicure Spa Chair Nepal",
    "Beauty Parlour Equipment Distributor Nepal",
    "eternityproducts.online",
    "Open-Box Cash on Delivery Nepal",
    "Ikonic Straightener Price Nepal",
  ],
  authors: [{ name: "Eternity Products Nepal", url: "https://www.eternityproducts.online" }],
  creator: "Eternity Products",
  publisher: "Eternity Products",
  category: "Beauty & Personal Care / Salon Equipment",
  // No canonical here on purpose. Each route declares its own via `alternates.canonical`;
  // a canonical set on the root layout is inherited by every child route that does not
  // override it, which previously pointed the entire catalogue at the homepage.
  // Task 3: Perfect Favicon Configuration for Google Search Results
  icons: {
    icon: [
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
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
    title: "Eternity Products | Luxury Salon & Spa Furniture",
    description:
      "Nepal's premier supplier of Ikonic titanium straighteners, blow dryers, curling wands, luxury hydraulic salon chairs (NPR 30k-40k range), and pedicure spa equipment. Open-box Cash on Delivery nationwide.",
    url: "https://www.eternityproducts.online",
    siteName: "Eternity Products",
    images: [
      {
        url: "https://www.eternityproducts.online/logo.png",
        width: 1200,
        height: 630,
        alt: "Eternity Products Official Logo",
      },
    ],
    locale: "en_NP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eternity Products | Luxury Salon & Spa Furniture",
    description: "Official authorized importer of Ikonic hair styling tools & Eternity luxury pedicure spa chairs in Nepal.",
    images: ["https://www.eternityproducts.online/logo.png"],
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
  "@type": ["Organization", "Store"],
  "@id": "https://www.eternityproducts.online/#store",
  name: "Eternity Products",
  legalName: "Eternity Products Importers & Distributors",
  url: "https://www.eternityproducts.online",
  logo: "https://www.eternityproducts.online/logo.png",
  image: "https://www.eternityproducts.online/logo_full_banner.jpg",
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
  geo: {
    "@type": "GeoCoordinates",
    latitude: 27.7172,
    longitude: 85.324,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "10:00",
      closes: "18:00",
    },
  ],
  priceRange: "NPR 30,000 - NPR 145,000",
  currenciesAccepted: "NPR",
  paymentAccepted: "Cash on Delivery, eSewa, Khalti, Fonepay, Bank Transfer",
  areaServed: [
    { "@type": "City", name: "Kathmandu" },
    { "@type": "City", name: "Lalitpur" },
    { "@type": "City", name: "Bhaktapur" },
    { "@type": "Country", name: "Nepal" },
  ],
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

// Task 1: WebSite Structured Data (JSON-LD) for Google Site Name
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Eternity Products",
  alternateName: ["Eternity Products Nepal", "Eternity Salon & Spa Nepal"],
  url: "https://www.eternityproducts.online",
  // No potentialAction: there is no server-side search route that reads a `q` parameter yet.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
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
        <Analytics />
      </body>
    </html>
  );
}
