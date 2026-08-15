"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ShoppingBag, ShieldCheck, UserCheck, Menu, X, Sparkles, Building2, PhoneCall } from "lucide-react";

interface HeaderProps {
  cartCount?: number;
  lang?: "en" | "np";
  onToggleLang?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount = 0,
  lang = "en",
  onToggleLang,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Announcement Bar */}
      <div className="bg-primary text-on-primary text-xs py-2 px-4 flex justify-between items-center tracking-wide font-medium">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="bg-gold text-on-surface px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Official Ikonic Nepal
            </span>
            <span className="hidden sm:inline">
              🚚 Open-Box Cash on Delivery Across Kathmandu & Major Nepal Cities
            </span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <a href="tel:+9779800000000" className="flex items-center hover:underline">
              <PhoneCall className="w-3 h-3 mr-1" /> Viber / Call: +977 9801234567
            </a>
            <span className="opacity-40">|</span>
            <button
              onClick={onToggleLang}
              className="font-bold hover:text-gold transition-colors underline"
            >
              {lang === "en" ? "🇳🇵 नेपाली" : "🇬🇧 English"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Glass Header */}
      <nav className="glass-header border-b border-outline-variant/50 px-4 lg:px-8 py-3">
        <div className="container mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gold/15 border border-gold/40 flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-gold/20" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-on-surface block leading-none">
                ETERNITY
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-outline font-semibold block mt-0.5">
                Products Nepal
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-7 text-sm font-medium text-on-surface-variant">
            <Link href="/" className="hover:text-gold transition-colors">
              Home
            </Link>
            <Link href="/c/hair-straighteners" className="hover:text-gold transition-colors">
              Straighteners
            </Link>
            <Link href="/c/hair-dryers" className="hover:text-gold transition-colors">
              Dryers & Curlers
            </Link>
            <Link href="/c/salon-furniture-equipment" className="hover:text-gold transition-colors font-semibold text-on-surface flex items-center">
              Salon Furniture
              <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-spa-blue text-secondary-on-container rounded font-bold uppercase">
                B2B Bulk
              </span>
            </Link>
            <Link href="/warranty" className="hover:text-gold transition-colors flex items-center text-xs text-outline">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-gold" /> Authenticity
            </Link>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="hidden md:flex items-center relative">
              <input
                type="text"
                placeholder="Search straightener, dryer, barber chair..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 lg:w-64 bg-surface-low border border-outline-variant text-xs rounded-lg py-2 pl-8 pr-3 focus:outline-none focus:border-gold transition-all"
              />
              <Search className="w-3.5 h-3.5 text-outline absolute left-2.5" />
            </div>

            {/* B2B Salon Portal Button */}
            <Link
              href="/salon/portal"
              className="hidden sm:flex items-center px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-inverse-surface hover:text-inverse-on-surface text-xs font-semibold text-on-surface transition-all border border-outline-variant"
            >
              <Building2 className="w-3.5 h-3.5 mr-1.5 text-gold" />
              Salon Account
            </Link>

            {/* Cart Button */}
            <Link
              href="/checkout"
              className="relative p-2 rounded-xl bg-gold text-on-surface hover:bg-gold-hover transition-colors shadow-soft"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-on-surface text-surface text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-on-surface focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-outline-variant/60 mt-3 pt-3 pb-2 space-y-2 animate-in slide-in-from-top duration-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium hover:bg-surface-low rounded-lg"
            >
              Home
            </Link>
            <Link
              href="/c/hair-straighteners"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium hover:bg-surface-low rounded-lg"
            >
              Hair Straighteners
            </Link>
            <Link
              href="/c/hair-dryers"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium hover:bg-surface-low rounded-lg"
            >
              Hair Dryers & Curlers
            </Link>
            <Link
              href="/c/salon-furniture-equipment"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-gold hover:bg-surface-low rounded-lg"
            >
              Salon Furniture & Equipment (B2B)
            </Link>
            <Link
              href="/salon/portal"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-medium bg-surface-container text-on-surface rounded-lg"
            >
              ✨ B2B Salon Portal Log In
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};
