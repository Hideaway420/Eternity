import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Award, Phone, Mail, MapPin, MessageSquare, Video } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#EAE4DC] border-t border-[#DCD4CA] text-on-surface mt-20">
      {/* Value Proposition Strip */}
      <div className="border-b border-[#D8CFC3] py-10 bg-[#F4EFE9] px-4 lg:px-8">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center text-gold flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-base">Genuine Ikonic Import</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Directly imported from Ikonic India. Every tool includes serial verification & 1-year warranty card.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center text-gold flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-base">Open-Box Cash on Delivery</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Open and inspect the box before making cash payment. Kathmandu Valley & all 77 districts covered.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center text-gold flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-base">B2B Salon Community</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Specialized wholesale pricing & equipment financing for beauty parlors & barber shop fit-outs.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center text-gold flex-shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-base">Fast 7-Day Replacement</h4>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Instant replacement guarantee for any manufacturing defects or transit damage.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links with Seamless Transparent Gold EP Logo */}
      <div className="container mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          {/* Task 1: Seamless Transparent Gold EP Logo */}
          <Link href="/" className="flex items-center space-x-3 mb-4 group inline-flex">
            <div className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                src="/logo.png"
                alt="Eternity Products Nepal Gold Logo"
                className="w-full h-full object-contain mix-blend-multiply filter drop-shadow-[0_2px_4px_rgba(212,175,55,0.4)]"
              />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-black tracking-tight block leading-none gold-motion-text">
                ETERNITY PRODUCTS
              </span>
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] block mt-1 gold-sub-motion">
                AUTHORIZED NEPAL IMPORTER
              </span>
            </div>
          </Link>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Nepal&apos;s leading authorized distributor of Ikonic professional hair styling tools, Eternity luxury chairs, and pedicure spa furniture.
          </p>
          
          <div className="mt-4 space-y-2 text-xs text-outline font-medium">
            <p className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-2 text-gold" /> New Road, Kathmandu, Nepal</p>
            <a href="https://wa.me/9779868089892" target="_blank" rel="noreferrer" className="flex items-center hover:text-gold transition-colors font-bold text-on-surface">
              <Phone className="w-3.5 h-3.5 mr-2 text-gold" /> +977 9868089892 (Call & WhatsApp)
            </a>
            <p className="flex items-center"><Mail className="w-3.5 h-3.5 mr-2 text-gold" /> sales@eternityproducts.com.np</p>
          </div>

          {/* Social Links */}
          <div className="mt-5 pt-4 border-t border-[#D8CFC3]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-outline mb-2">Connect & Shop Social</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href="https://www.tiktok.com/@eternity.products?is_from_webapp=1&sender_device=pc"
                target="_blank"
                rel="noreferrer"
                className="flex items-center px-3 py-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 font-semibold transition-all shadow-sm"
              >
                <Video className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                <span>TikTok Shop</span>
              </a>
              <a
                href="https://wa.me/9779868089892"
                target="_blank"
                rel="noreferrer"
                className="flex items-center px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold transition-all shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-sm mb-3 uppercase tracking-wider text-outline">Retail Categories</h4>
          <ul className="space-y-2 text-xs text-on-surface-variant font-medium">
            <li><Link href="/c/manicure-pedicure-spa-furniture" className="hover:text-gold transition-colors font-bold text-gold">Manicure & Pedicure Spa Furniture</Link></li>
            <li><Link href="/c/luxury-chairs" className="hover:text-gold transition-colors font-bold text-on-surface">Luxury Salon Chairs</Link></li>
            <li><Link href="/c/eyewear" className="hover:text-gold transition-colors font-bold text-on-surface">Premium Eyewears</Link></li>
            <li><Link href="/c/hair-straighteners" className="hover:text-gold transition-colors">Hair Straighteners & Crimpers</Link></li>
            <li><Link href="/c/hair-dryers-curlers" className="hover:text-gold transition-colors">Professional Blow Dryers & Curlers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-sm mb-3 uppercase tracking-wider text-outline">Salon B2B Hub</h4>
          <ul className="space-y-2 text-xs text-on-surface-variant font-medium">
            <li><Link href="/c/spa" className="hover:text-gold transition-colors font-bold text-on-surface">Wholesale B2B Catalog & Bulk Pricing</Link></li>
            <li><Link href="/c/luxury-salon-chairs" className="hover:text-gold transition-colors">Barber Chairs & Styling Stations</Link></li>
            <li><Link href="/c/spa" className="hover:text-gold transition-colors">Pedicure Tubs & Spa Beds</Link></li>
            <li><Link href="/contact" className="hover:text-gold transition-colors">Concierge Support & Head Office</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-sm mb-3 uppercase tracking-wider text-outline">Accepted Nepal Payments</h4>
          <p className="text-xs text-on-surface-variant mb-4 font-light">
            Cash on Delivery, eSewa, Khalti, Fonepay QR, and direct Nepal Bank Transfer.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 bg-surface rounded border border-[#DCD4CA]">🇳🇵 Cash on Delivery</span>
            <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded border border-green-200">eSewa</span>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200">Khalti</span>
            <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded border border-red-200">Fonepay</span>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D8CFC3] py-6 text-center text-xs text-outline bg-[#F4EFE9]">
        <p>© {new Date().getFullYear()} Eternity Products Nepal. All rights reserved. Prices in NPR (VAT 13% Inclusive).</p>
      </div>
    </footer>
  );
};
