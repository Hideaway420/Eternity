"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  PhoneCall,
  ShieldCheck,
  Building2,
  Footprints,
  Flame,
} from "lucide-react";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { SearchModal } from "@/components/storefront/SearchModal";
import { useLanguage } from "@/lib/i18n";
import { useCartStore } from "@/store/useCartStore";

export const Header: React.FC = () => {
  const { isNp, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Client hydration check for persistent LocalStorage Zustand store
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Rule 1 & Rule 2: Derive total quantity dynamically by reducing cartItems array
  const cartItems = useCartStore((state) => state.cartItems);
  const derivedTotalItems = isMounted
    ? cartItems.reduce((total, item) => total + item.qty, 0)
    : 0;

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Top Center-Aligned Announcement Bar */}
      <div className="bg-[#1E2224] text-white py-2 px-2 sm:px-4 text-[10px] sm:text-xs font-semibold border-b border-neutral-800">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-2">
          {/* Left: Official Brand Badge */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/40 text-[9px] uppercase font-bold tracking-wider">
              🇳🇵 OFFICIAL ETERNITY
            </span>
          </div>

          {/* Center: Main Offer Link (Centered Alignment) */}
          <div className="text-center flex-1 min-w-0">
            <Link
              href="/c/spa"
              className="hover:text-gold transition-colors font-bold truncate inline-flex items-center space-x-1.5 text-[11px] sm:text-xs"
            >
              <Flame className="w-3.5 h-3.5 text-gold flex-shrink-0 animate-pulse" />
              <span className="truncate">
                {isNp
                  ? "🔥 सीमित समयको अफर: लग्जरी स्पा कुर्सीहरूमा ५% छूट र १०%-१५% पेश्की बुकिङ!"
                  : "Limited Offer: 5% OFF & 10%-15% Upfront Deposit on Luxury Spa Chairs!"}
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

      {/* Main Header Navbar */}
      <nav className="bg-[#F8F3EC] backdrop-blur-md border-b border-[#E8E1D7] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-sm">
        <div className="container mx-auto flex items-center justify-between gap-4 sm:gap-6">
          {/* Gold Logo & Motion Title */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="Eternity Products Logo"
                className="w-full h-full object-contain mix-blend-multiply filter drop-shadow-[0_2px_4px_rgba(212,175,55,0.4)]"
              />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-black tracking-tight block leading-none gold-motion-text">
                ETERNITY
              </span>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] block mt-1 gold-sub-motion">
                {isNp ? "इटरनिटी नेपाल" : "PRODUCTS NEPAL"}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden xl:flex items-center space-x-7 text-sm font-semibold text-[#2C2A29]">
            <Link href="/" className="hover:text-gold transition-colors font-bold whitespace-nowrap">
              {isNp ? "गृहपृष्ठ" : "Home"}
            </Link>
            
            <Link href="/c/spa" className="hover:text-gold transition-colors font-black text-gold flex items-center whitespace-nowrap">
              <Footprints className="w-4 h-4 mr-1 text-gold" />
              {isNp ? "लग्जरी पेडिक्योर र स्पा कुर्सीहरू" : "Luxury Pedicure & Spa Chairs"}
            </Link>

            <Link href="/c/luxury-salon-chairs" className="hover:text-gold transition-colors font-bold text-[#2C2A29] whitespace-nowrap">
              {isNp ? "लग्जरी सलोन कुर्सीहरू" : "Luxury Salon Chairs"}
            </Link>

            <Link href="/c/hair-straighteners" className="hover:text-gold transition-colors font-bold whitespace-nowrap">
              {isNp ? "स्ट्रेटरहरू" : "Straighteners"}
            </Link>

            <Link href="/c/hair-dryers" className="hover:text-gold transition-colors font-bold whitespace-nowrap">
              {isNp ? "ड्रायर र कर्लर" : "Dryers & Curlers"}
            </Link>

            <Link href="/warranty" className="hover:text-gold transition-colors flex items-center text-xs text-outline font-semibold whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-gold" /> {isNp ? "असली उत्पादन" : "Authenticity"}
            </Link>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Search Trigger Button */}
            <button
              id="search-modal-trigger"
              onClick={() => setSearchModalOpen(true)}
              className="hidden md:flex items-center space-x-3 bg-white/90 hover:bg-white border border-[#E0D8CD] text-xs rounded-xl py-2 px-3.5 text-outline hover:text-on-surface transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-gold" />
              <span className="font-semibold text-[#3D3A37]">
                {isNp ? "स्पा कुर्सी, पेडीक्योर खोज्नुहोस्..." : "Search spa chairs..."}
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#F2EBE1] border border-[#D8CFC3] rounded text-outline font-bold">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="md:hidden p-2 text-on-surface hover:text-gold rounded-lg"
              aria-label="Toggle Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Salon B2B Portal */}
            <Link
              href="/salon/portal"
              className="hidden sm:flex items-center px-3.5 py-1.5 rounded-lg bg-[#EFE8DE] hover:bg-inverse-surface hover:text-inverse-on-surface text-xs font-semibold text-[#2C2A29] transition-all border border-[#DDD4C7]"
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-gold" />
              <span className="font-bold">{isNp ? "सलोन खाता" : "Salon Account"}</span>
            </Link>

            {/* Slide-Over Cart Drawer Trigger Button with Dynamic Derived Badge */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-xl bg-gold text-on-surface hover:bg-gold-hover transition-colors shadow-soft"
              aria-label="View Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              
              {/* Rule 2: Derived Badge. If total <= 0, badge COMPLETELY DISAPPEARS */}
              {derivedTotalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[10px] font-bold min-w-[18px] h-4 sm:h-5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-in zoom-in duration-200 font-mono">
                  {derivedTotalItems}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-on-surface focus:outline-none rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#E8E1D7] mt-2 pt-3 pb-3 space-y-2 bg-[#F5F0E8] p-4 rounded-2xl border shadow-soft animate-in slide-in-from-top duration-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl font-bold text-xs hover:bg-white text-[#2C2A29]"
            >
              {isNp ? "गृहपृष्ठ" : "Home"}
            </Link>
            <Link
              href="/c/spa"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl font-black text-xs text-gold hover:bg-white flex items-center"
            >
              <Footprints className="w-4 h-4 mr-2 text-gold" />
              {isNp ? "लग्जरी पेडिक्योर र स्पा कुर्सीहरू" : "Luxury Pedicure & Spa Chairs"}
            </Link>
            <Link
              href="/c/luxury-salon-chairs"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl font-bold text-xs hover:bg-white text-[#2C2A29]"
            >
              {isNp ? "लग्जरी सलोन कुर्सीहरू" : "Luxury Salon Chairs"}
            </Link>
            <Link
              href="/c/hair-straighteners"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl font-bold text-xs hover:bg-white text-[#2C2A29]"
            >
              {isNp ? "स्ट्रेटरहरू" : "Straighteners"}
            </Link>
            <Link
              href="/c/hair-dryers"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl font-bold text-xs hover:bg-white text-[#2C2A29]"
            >
              {isNp ? "ड्रायर र कर्लर" : "Dryers & Curlers"}
            </Link>
            <Link
              href="/warranty"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-xl font-bold text-xs hover:bg-white text-outline"
            >
              {isNp ? "असली उत्पादन वारंटी" : "Authenticity & Warranty"}
            </Link>
          </div>
        )}
      </nav>

      {/* Global Modals */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </header>
  );
};
