"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, ShieldCheck, Menu, X, Building2, PhoneCall } from "lucide-react";
import { SearchModal } from "@/components/storefront/SearchModal";
import { CartDrawer } from "@/components/storefront/CartDrawer";

interface HeaderProps {
  cartCount?: number;
  lang?: "en" | "np";
  onToggleLang?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount = 1,
  lang: initialLang = "en",
  onToggleLang,
}) => {
  const [currentLang, setCurrentLang] = useState<"en" | "np">(initialLang);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLang = currentLang === "en" ? "np" : "en";
    setCurrentLang(nextLang);
    if (onToggleLang) onToggleLang();
  };

  const isNp = currentLang === "np";

  return (
    <>
      <header className="sticky top-0 z-50 w-full transition-all duration-300">
        {/* Announcement Bar */}
        <div className="bg-primary text-on-primary text-[11px] sm:text-xs py-2 px-3 sm:px-4 tracking-wide font-medium">
          <div className="container mx-auto flex justify-between items-center gap-2">
            <div className="flex items-center space-x-2 truncate">
              <span className="bg-gold text-on-surface px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex-shrink-0">
                {isNp ? "आधिकारिक इटरनिटी" : "Official Eternity"}
              </span>
              <span className="truncate hidden xs:inline">
                {isNp
                  ? "🚚 काठमाडौँ र नेपालभरि ओपन-बक्स क्यास अन डेलिभरी"
                  : "🚚 Open-Box Cash on Delivery Across Nepal"}
              </span>
            </div>

            <div className="flex items-center space-x-3 flex-shrink-0">
              <a
                href="https://wa.me/9779868089892"
                target="_blank"
                rel="noreferrer"
                className="flex items-center hover:underline font-bold text-gold text-[11px]"
              >
                <PhoneCall className="w-3 h-3 mr-1" />
                <span className="hidden sm:inline">Viber / WhatsApp: </span>
                <span>+977 9868089892</span>
              </a>
              <span className="opacity-40">|</span>
              <button
                onClick={toggleLanguage}
                className="font-bold hover:text-gold transition-colors underline flex items-center space-x-1"
              >
                <span>{isNp ? "🇬🇧 EN" : "🇳🇵 NP"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Glass Header (Featuring Official Gold EP Infinity Logo) */}
        <nav className="glass-header border-b border-outline-variant/50 px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5">
          <div className="container mx-auto flex items-center justify-between gap-3">
            {/* Official Brand Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden bg-black/90 p-1 border border-gold/50 shadow-gold group-hover:scale-105 transition-transform flex-shrink-0 flex items-center justify-center">
                <img src="/logo.png" alt="Eternity Products Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-on-surface block leading-none">
                  ETERNITY
                </span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-gold font-semibold block mt-0.5">
                  {isNp ? "इटरनिटी नेपाल" : "Products Nepal"}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-on-surface-variant">
              <Link href="/" className="hover:text-gold transition-colors">
                {isNp ? "गृहपृष्ठ" : "Home"}
              </Link>
              <Link href="/c/hair-straighteners" className="hover:text-gold transition-colors">
                {isNp ? "स्ट्रेटरहरू" : "Straighteners"}
              </Link>
              <Link href="/c/hair-dryers" className="hover:text-gold transition-colors">
                {isNp ? "ड्रायर र कर्लर" : "Dryers & Curlers"}
              </Link>
              <Link href="/c/luxury-salon-chairs" className="hover:text-gold transition-colors font-semibold text-on-surface">
                {isNp ? "लग्जरी कुर्सीहरू" : "Luxury Chairs"}
              </Link>
              <Link href="/c/manicure-pedicure-equipment" className="hover:text-gold transition-colors font-semibold text-on-surface">
                {isNp ? "पेडिक्योर स्पा कुर्सीहरू" : "Luxury Pedicure Spa Chairs"}
              </Link>
              <Link href="/warranty" className="hover:text-gold transition-colors flex items-center text-xs text-outline">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-gold" /> {isNp ? "असली उत्पादन" : "Authenticity"}
              </Link>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Command + K Instant Search Button */}
              <button
                id="search-modal-trigger"
                onClick={() => setSearchModalOpen(true)}
                className="hidden md:flex items-center space-x-3 bg-surface-low hover:bg-surface-container border border-outline-variant text-xs rounded-xl py-2 px-3 text-outline hover:text-on-surface transition-all"
              >
                <Search className="w-3.5 h-3.5 text-gold" />
                <span className="font-medium">
                  {isNp ? "लग्जरी कुर्सी, पेडिक्योर स्पा खोज्नुहोस्..." : "Search luxury chairs, pedicure spa..."}
                </span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-lowest border border-outline-variant rounded text-outline">
                  ⌘K
                </kbd>
              </button>

              {/* Mobile Search Icon Button */}
              <button
                onClick={() => setSearchModalOpen(true)}
                className="md:hidden p-2 text-on-surface hover:text-gold rounded-lg"
                aria-label="Toggle Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* B2B Salon Portal Button */}
              <Link
                href="/salon/portal"
                className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-inverse-surface hover:text-inverse-on-surface text-xs font-semibold text-on-surface transition-all border border-outline-variant"
              >
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-gold" />
                <span className="font-bold">{isNp ? "सलोन खाता" : "Salon Account"}</span>
              </Link>

              {/* Slide-Over Cart Drawer Button */}
              <button
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 sm:p-2.5 rounded-xl bg-gold text-on-surface hover:bg-gold-hover transition-colors shadow-soft"
                aria-label="View Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-on-surface text-surface text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-surface">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-on-surface focus:outline-none rounded-lg"
                aria-label="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-outline-variant/60 mt-3 pt-3 pb-3 space-y-2 animate-in slide-in-from-top duration-200">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 text-sm font-medium hover:bg-surface-low rounded-xl"
              >
                {isNp ? "गृहपृष्ठ" : "Home"}
              </Link>
              <Link
                href="/c/hair-straighteners"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 text-sm font-medium hover:bg-surface-low rounded-xl"
              >
                {isNp ? "स्ट्रेटरहरू" : "Straighteners"}
              </Link>
              <Link
                href="/c/luxury-salon-chairs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 text-sm font-bold text-gold hover:bg-surface-low rounded-xl"
              >
                {isNp ? "लग्जरी सलोन कुर्सीहरू" : "Luxury Salon Chairs"}
              </Link>
              <Link
                href="/c/manicure-pedicure-equipment"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 text-sm font-bold text-spa-blue hover:bg-surface-low rounded-xl"
              >
                {isNp ? "लग्जरी पेडिक्योर स्पा कुर्सीहरू" : "Luxury Pedicure Spa Chairs"}
              </Link>
              <Link
                href="/warranty"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 text-sm font-medium text-outline hover:bg-surface-low rounded-xl"
              >
                <ShieldCheck className="w-4 h-4 inline mr-2 text-gold" />
                {isNp ? "असली उत्पादन वारेन्टी" : "Authenticity Guarantee"}
              </Link>
              <Link
                href="/salon/portal"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 text-sm font-bold bg-surface-container text-on-surface rounded-xl border border-outline-variant"
              >
                ✨ {isNp ? "सलोन पोर्टलम लग्न इन् गर्नुहोस्" : "B2B Salon Portal Log In"}
              </Link>
            </div>
          )}
        </nav>
      </header>

      {/* Global Interactive Modals */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  );
};
