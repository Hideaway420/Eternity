import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { Footprints, Armchair, Sparkles, ArrowRight, Home, HelpCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F6F2EC] text-on-surface">
      <Header />

      <main className="flex-1 py-16 container mx-auto px-4 lg:px-8 max-w-4xl space-y-12">
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold/15 text-gold border border-gold/40 text-xs font-bold">
            <HelpCircle className="w-4 h-4" />
            <span>404 — Page Not Found</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-on-surface">
            Looking for Luxury Spa Chairs or Hair Styling Tools?
          </h1>
          <p className="text-xs sm:text-base text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed">
            We couldn&apos;t find the exact page URL you were looking for. Explore our featured salon equipment collections or head back to the main shop below.
          </p>

          <div className="pt-4 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="px-6 py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs sm:text-sm shadow-gold transition-colors inline-flex items-center space-x-2"
            >
              <Home className="w-4 h-4" />
              <span>Return to Storefront</span>
            </Link>
            <Link
              href="/c/manicure-pedicure-spa-furniture"
              className="px-6 py-3.5 rounded-xl bg-inverse-surface text-white hover:bg-neutral-800 font-bold text-xs sm:text-sm transition-colors inline-flex items-center space-x-2"
            >
              <Footprints className="w-4 h-4 text-gold" />
              <span>Explore SPA Collection</span>
            </Link>
          </div>
        </div>

        {/* Featured Category Shortcuts (Prevent Dead End) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-outline-variant/60">
          <Link
            href="/c/manicure-pedicure-spa-furniture"
            className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant hover:border-gold/60 transition-all shadow-soft group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-gold/15 flex items-center justify-center text-gold font-bold">
              ✨
            </div>
            <h3 className="font-serif font-bold text-lg text-on-surface group-hover:text-gold transition-colors">
              Pedicure Spa Chairs
            </h3>
            <p className="text-xs text-outline font-light leading-relaxed">
              Hydromassage basins, 15% booking deposit, & custom salon color matching (+NPR 6,000).
            </p>
            <div className="text-xs font-bold text-gold flex items-center pt-1">
              <span>View Collection</span> <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/c/luxury-chairs"
            className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant hover:border-gold/60 transition-all shadow-soft group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-gold/15 flex items-center justify-center text-gold font-bold">
              💈
            </div>
            <h3 className="font-serif font-bold text-lg text-on-surface group-hover:text-gold transition-colors">
              Luxury Salon Chairs
            </h3>
            <p className="text-xs text-outline font-light leading-relaxed">
              Heavy-duty hydraulic reclining styling chairs with 360-degree lockable swivel base.
            </p>
            <div className="text-xs font-bold text-gold flex items-center pt-1">
              <span>View Collection</span> <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/c/hair-straighteners"
            className="p-6 rounded-3xl bg-surface-lowest border border-outline-variant hover:border-gold/60 transition-all shadow-soft group space-y-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-gold/15 flex items-center justify-center text-gold font-bold">
              ✂️
            </div>
            <h3 className="font-serif font-bold text-lg text-on-surface group-hover:text-gold transition-colors">
              Ikonic Hair Straighteners
            </h3>
            <p className="text-xs text-outline font-light leading-relaxed">
              Official Ikonic titanium straighteners & blow dryers with serial verification card.
            </p>
            <div className="text-xs font-bold text-gold flex items-center pt-1">
              <span>View Collection</span> <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
