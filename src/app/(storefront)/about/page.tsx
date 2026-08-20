import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { ShieldCheck, Award, Building2, Truck, Sparkles, HelpCircle, PhoneCall, CheckCircle2, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us & Frequently Asked Questions (FAQ) | Eternity Products Nepal",
  description:
    "Learn about Eternity Products Nepal, authorized importer of Ikonic styling tools & luxury pedicure spa chairs. Read our FAQ on Open-Box Cash on Delivery, 1-year warranty, serial verification, and 10%-15% deposit booking terms.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Us & FAQ | Eternity Products Nepal",
    description: "Authorized Nepal importer of Ikonic Professional tools & luxury salon furniture.",
    url: "/about",
    siteName: "Eternity Products",
    locale: "en_NP",
    type: "website",
  },
};

const FAQ_ITEMS = [
  {
    q: "Is Eternity Products an official authorized importer of Ikonic in Nepal?",
    a: "Yes. Eternity Products is an official importer and distributor of genuine Ikonic Professional hair styling tools (straighteners, blow dryers, curling wands) imported directly from Ikonic India. Every tool comes with a serialized hologram verification card and an official 13% VAT tax invoice.",
  },
  {
    q: "How does Open-Box Cash on Delivery (COD) work across Nepal?",
    a: "We offer Open-Box Cash on Delivery across Kathmandu Valley and all 77 districts of Nepal. Our delivery rider will allow you to open the package and inspect your item to verify serial authenticity before you pay cash.",
  },
  {
    q: "What are the payment terms for the Manicure & Pedicure Spa Furniture Collection?",
    a: "Because our Manicure & Pedicure Spa Furniture features bespoke upholstery, hydromassage basins, and optional Custom Salon Color Matching (+NPR 6,000), we require a 10% - 15% upfront booking deposit via eSewa, Khalti, or Bank Transfer. The remaining balance is payable upon delivery inspection.",
  },
  {
    q: "Are prices on eternityproducts.online inclusive of 13% VAT?",
    a: "Yes! All listed prices on eternityproducts.online are 100% inclusive of 13% Government VAT. Official tax invoices are provided with every order for salon expense tax deductions.",
  },
  {
    q: "What is the warranty and replacement policy?",
    a: "All electrical hair tools and hydraulic salon equipment carry a 1-Year Full Replacement Warranty against manufacturing defects. If any issue arises, our Kathmandu service center provides instant replacement or repair.",
  },
  {
    q: "Do you offer wholesale B2B pricing for new salon fit-outs?",
    a: "Absolutely! We offer special bulk discounts for beauty parlors, barbershops, and spa resorts ordering 3+ chairs or complete salon setups. You can also use our interactive B2B ROI Calculator on any product page or contact us on WhatsApp at +977 9868089892.",
  },
];

// Google FAQPage JSON-LD Structured Data
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      <main className="flex-1 py-12 sm:py-16 container mx-auto px-4 lg:px-8 max-w-4xl space-y-16">
        {/* About Header Banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/15 text-on-surface border border-gold/40 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span>Official Nepal Importer & Wholesale Distributor</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-on-surface">
            About Eternity Products Nepal
          </h1>
          <p className="text-xs sm:text-base text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed">
            Eternity Products is Nepal&apos;s premier importer and distributor of Ikonic Professional hair styling tools, Eternity luxury hydraulic salon chairs, and pedicure spa equipment.
          </p>
        </div>

        {/* Core Divisions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="p-8 rounded-3xl bg-surface-lowest border border-outline-variant space-y-4 shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center text-gold text-2xl font-bold">
              ✨
            </div>
            <h3 className="font-serif font-bold text-xl text-on-surface">D2C Styling Tools Division</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light">
              We bring high-end titanium hair straighteners, 2500+ AC motor blow dryers, and curling wands directly to stylists and beauty enthusiasts across Nepal with Open-Box Cash on Delivery.
            </p>
            <div className="pt-2 flex items-center text-xs font-bold text-gold">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> 100% Serialized Warranty Card
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-surface-lowest border border-outline-variant space-y-4 shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center text-gold text-2xl font-bold">
              💈
            </div>
            <h3 className="font-serif font-bold text-xl text-on-surface">B2B Salon Fit-Out Suite</h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light">
              We partner directly with beauty parlours, barber shops, and luxury spa resorts to fit out their floors with heavy-duty hydraulic chairs, shampoo basins, and pedicure spa stations.
            </p>
            <div className="pt-2 flex items-center text-xs font-bold text-gold">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Custom Salon Color Matching (+NPR 6,000)
            </div>
          </div>
        </div>

        {/* FREQUENTLY ASKED QUESTIONS (FAQ) SECTION */}
        <section className="space-y-8 pt-6 border-t border-outline-variant/60">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-gold font-bold flex items-center justify-center">
              <HelpCircle className="w-4 h-4 mr-1.5" /> Knowledge Base
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-xs sm:text-sm text-outline max-w-xl mx-auto font-light">
              Everything you need to know about ordering, warranties, open-box delivery, and salon booking deposits.
            </p>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant/80 shadow-soft space-y-2"
              >
                <h4 className="font-serif font-bold text-base text-on-surface flex items-start">
                  <span className="text-gold font-mono font-bold mr-2 text-sm">Q{idx + 1}.</span>
                  <span>{item.q}</span>
                </h4>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed pl-6 font-light">
                  {item.a}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Support CTA Box */}
          <div className="p-8 rounded-3xl bg-gold/15 border-2 border-gold/40 text-center space-y-4">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-on-surface">
              Have More Questions About Salon Fit-Outs?
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto font-light">
              Our concierge management team is available on WhatsApp & Viber to assist with custom quotes, color samples, and bulk orders.
            </p>
            <div className="pt-2 flex justify-center space-x-4">
              <a
                href="https://wa.me/9779868089892"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs shadow-gold transition-colors inline-flex items-center space-x-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Chat on WhatsApp (+977 9868089892)</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
