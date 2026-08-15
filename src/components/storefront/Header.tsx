"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, ShieldCheck, Menu, X, Building2, PhoneCall, Sparkles, Footprints, Flame } from "lucide-react";
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
        {/* Top Announcement Bar */}
        <div className="bg-[#4A4744] text-white text-[11px] sm:text-xs py-2 px-3 sm:px-4 tracking-wide font-medium border-b border-neutral-700">
          <div className="container mx-auto flex justify-between items-center gap-2">
            {/* Left: Limited Offer Link to Spa Page */}
            <div className="flex items-center space-x-2 truncate">
              <span className="bg-gold text-on-surface px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex-shrink-0 flex items-center">
                <Sparkles className="w-2.5 h-2.5 mr-1" />
                {isNp ? "आधिकारिक इटरनिटी" : "OFFICIAL ETERNITY"}
              </span>
              <Link
                href="/c/spa"
                className="hover:text-gold transition-colors font-semibold truncate flex items-center space-x-1.5"
              >
                <Flame className="w-3.5 h-3.5 text-gold flex-shrink-0 animate-pulse" />
                <span className="truncate">
                  {isNp
                    ? "🔥 सीमित समयको अफर: लग्जरी स्पा कुर्सीहरूमा ५% छूट र १०%-१५% पेश्की बुकिङ!"
                    : "🔥 Limited Offer: 5% OFF & 10%-15% Upfront Deposit on Luxury Spa Chairs!"}
                </span>
              </Link>
            </div>

            {/* Right: Phone & Language Switcher */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <a
                href="https://wa.me/9779868089892"
                target="_blank"
                rel="noreferrer"
                className="flex items-center hover:underline font-bold text-gold text-[11px]"
              >
                <PhoneCall className="w-3 h-3 mr-1 text-gold" />
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

        {/* Main Header with Dark White / Cream Background (#F5F1EB) and Seamless Banner Logo */}
        <nav className="glass-header border-b border-[#E2DAD0] px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 shadow-soft">
          <div className="container mx-auto flex items-center justify-between gap-3">
            {/* Seamless Brand Banner Logo (Matches Provided Reference Image) */}
            <Link href="/" className="flex items-center group">
              <div className="h-10 sm:h-12 flex items-center justify-center group-hover:scale-105 transition-transform">
                <img
                  src="/logo_full_banner.jpg"
                  alt="Eternity Products Nepal Logo"
                  className="h-full w-auto object-contain mix-blend-multiply rounded-md"
                />
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-[#2C2A29]">
              <Link href="/" className="hover:text-gold transition-colors font-bold">
                {isNp ? "गृहपृष्ठ" : "Home"}
              </Link>
              <Link href="/c/spa" className="hover:text-gold transition-colors font-black text-gold flex items-center">
                <Footprints className="w-4 h-4 mr-1 text-gold" />
                {isNp ? "लग्जरी पेडिक्योर स्पा कुर्सीहरू" : "SPA"}
              </Link>
              <Link href="/c/luxury-salon-chairs" className="hover:text-gold transition-colors font-bold text-[#2C2A29]">
                {isNp ? "लग्जरी कुर्सीहरू" : "Luxury Chairs"}
              </Link>
              <Link href="/c/hair-straighteners" className="hover:text-gold transition-colors font-bold">
                {isNp ? "स्ट्रेटरहरू" : "Straighteners"}
              </Link>
              <Link href="/c/hair-dryers" className="hover:text-gold transition-colors font-bold">
                {isNp ? "ड्रायर र कर्लर" : "Dryers & Curlers"}
              </Link>
              <Link href="/warranty" className="hover:text-gold transition-colors flex items-center text-xs text-outline font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-gold" /> {isNp ? "असली उत्पादन" : "Authenticity"}
              </Link>
            </div>

            {/* Search & Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Command + K Instant Search Button */}
              <button
                id="search-modal-trigger"
                onClick={() => setSearchModalOpen(true)}
                className="hidden md:flex items-center space-x-3 bg-white/80 hover:bg-white border border-[#DCD4CA] text-xs rounded-xl py-2 px-3 text-outline hover:text-on-surface transition-all shadow-sm"
              >
                <Search className="w-3.5 h-3.5 text-gold" />
                <span className="font-semibold text-[#4A4744]">
                  {isNp ? "स्पा कुर्सी, पेडीक्योर खोज्नुहोस्..." : "Search spa chairs, pedicure..."}
                </span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-lowest border border-[#DCD4CA] rounded text-outline font-bold">
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
                className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-[#EAE2D8] hover:bg-inverse-surface hover:text-inverse-on-surface text-xs font-semibold text-[#2C2A29] transition-all border border-[#D8CFC3]"
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
            <div className="lg:hidden border-t border-[#E2DAD0] mt-3 pt-3 pb-3 space-y-2 animate-in slide-in-from-top duration-200">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 text-sm font-bold hover:bg-white/60 rounded-xl"
              >
                {isNp ? "गृहपृष्ठ" : "Home"}
              </Link>
              <Link
                href="/c/spa"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 text-sm font-black text-gold hover:bg-white/60 rounded-xl"
              >
                {isNp ? "लग्जरी पेडिक्योर स्पा कुर्सीहरू" : "SPA Collection"}
              </Link>
              <Link
                href="/c/luxury-salon-chairs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 text-sm font-bold hover:bg-white/60 rounded-xl"
              >
                {isNp ? "लग्जरी सलोन कुर्सीहरू" : "Luxury Salon Chairs"}
              </Link>
              <Link
                href="/c/hair-straighteners"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 text-sm font-medium hover:bg-white/60 rounded-xl"
              >
                {isNp ? "स्ट्रेटरहरू" : "Straighteners"}
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
