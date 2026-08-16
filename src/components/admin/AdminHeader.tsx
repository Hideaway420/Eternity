"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PackageCheck,
  PhoneCall,
  Boxes,
  ShoppingCart,
  Radio,
  FileBarChart,
  Home,
  Menu,
  X,
  Sparkles,
} from "lucide-react";

interface AdminHeaderProps {
  pendingCodCount?: number;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ pendingCodCount = 0 }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      href: "/admin/products",
      label: "Catalog & Products",
      icon: PackageCheck,
      badge: null,
    },
    {
      href: "/admin/cod-queue",
      label: "COD Queue",
      icon: PhoneCall,
      badge: pendingCodCount > 0 ? `(${pendingCodCount})` : null,
    },
    {
      href: "/admin/inventory",
      label: "Inventory",
      icon: Boxes,
      badge: null,
    },
    {
      href: "/admin/purchase-orders",
      label: "Purchase Orders",
      icon: ShoppingCart,
      badge: null,
    },
    {
      href: "/admin/broadcasts",
      label: "Broadcasts",
      icon: Radio,
      badge: null,
    },
    {
      href: "/admin/reports",
      label: "Reports (Gated)",
      icon: FileBarChart,
      badge: null,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#F8F3EC] backdrop-blur-md border-b border-[#E8E1D7] px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-sm">
      <div className="container mx-auto flex items-center justify-between gap-4">
        {/* Brand & Seamless Gold EP Logo */}
        <Link href="/admin" className="flex items-center space-x-3 group flex-shrink-0">
          <div className="h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
            <img
              src="/logo.png"
              alt="Eternity Staff Logo"
              className="w-full h-full object-contain mix-blend-multiply filter drop-shadow-[0_2px_4px_rgba(212,175,55,0.4)]"
            />
          </div>
          <div>
            <span className="font-serif text-lg sm:text-xl font-black tracking-tight block leading-none gold-motion-text">
              ETERNITY STAFF
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] block mt-1 gold-sub-motion">
              OPERATIONS HUB
            </span>
          </div>
        </Link>

        {/* Desktop Near-White Navigation Bar (Matches Ref Images 1, 3, & 4) */}
        <nav className="hidden xl:flex items-center space-x-2 text-xs font-semibold">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-xl transition-all flex items-center space-x-1.5 border whitespace-nowrap ${
                  isActive
                    ? "bg-gold/20 border-gold/50 text-[#1B1C1C] font-bold shadow-soft"
                    : "bg-white/80 hover:bg-white border-[#E0D8CD] text-[#3D3A37] hover:border-gold/40"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-gold" : "text-[#B58A18]"}`} />
                <span>{link.label}</span>
                {link.badge && <span className="text-gold font-bold font-mono ml-0.5">{link.badge}</span>}
              </Link>
            );
          })}

          <Link
            href="/"
            className="px-3 py-2 rounded-xl bg-[#EFE8DE] hover:bg-[#E5DCD0] text-[#4A4744] font-bold border border-[#DDD4C7] transition-all flex items-center space-x-1.5 ml-2"
          >
            <Home className="w-3.5 h-3.5 text-outline" />
            <span>Storefront</span>
          </Link>
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="xl:hidden p-2.5 rounded-xl bg-white border border-[#E0D8CD] text-[#2C2A29] shadow-sm"
          aria-label="Toggle Staff Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Near-White Mobile Staff Menu Drawer (NO DARK OVERLAY) */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-[#E8E1D7] mt-3 pt-3 pb-3 space-y-2 animate-in slide-in-from-top duration-200 bg-[#F5F0E8] p-4 rounded-2xl border shadow-soft">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-gold uppercase tracking-wider mb-2 px-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Staff Operations Navigation</span>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-2.5 p-3 rounded-xl text-xs font-bold transition-all border ${
                  isActive
                    ? "bg-gold/20 border-gold/50 text-[#1B1C1C]"
                    : "bg-white/90 border-[#E0D8CD] text-[#3D3A37] hover:bg-white"
                }`}
              >
                <Icon className="w-4 h-4 text-gold" />
                <span>{link.label}</span>
                {link.badge && <span className="font-mono text-gold font-bold ml-auto">{link.badge}</span>}
              </Link>
            );
          })}

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 p-3 rounded-xl bg-[#EFE8DE] border border-[#DDD4C7] text-xs font-bold text-[#4A4744] hover:bg-[#E5DCD0]"
          >
            <Home className="w-4 h-4 text-outline" />
            <span>Return to Public Storefront</span>
          </Link>
        </div>
      )}
    </header>
  );
};
