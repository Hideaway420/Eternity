import React from "react";
import Link from "next/link";
import { ShieldCheck, Truck, RotateCcw, Award, Phone, Mail, MapPin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-high border-t border-outline-variant text-on-surface mt-20">
      {/* Value Proposition Strip */}
      <div className="border-b border-outline-variant/60 py-10 bg-surface-low px-4 lg:px-8">
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
              <h4 className="font-serif font-semibold text-base">Open-Box COD Delivery</h4>
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

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-serif text-xl font-bold tracking-tight">ETERNITY PRODUCTS</h3>
          <p className="text-xs text-on-surface-variant mt-3 leading-relaxed">
            Nepal&apos;s leading authorized distributor of Ikonic professional hair styling tools, barber equipment, and salon spa furniture.
          </p>
          <div className="mt-4 space-y-2 text-xs text-outline">
            <p className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-2 text-gold" /> New Road, Kathmandu, Nepal</p>
            <p className="flex items-center"><Phone className="w-3.5 h-3.5 mr-2 text-gold" /> +977 9801234567 / 01-4200000</p>
            <p className="flex items-center"><Mail className="w-3.5 h-3.5 mr-2 text-gold" /> sales@eternityproducts.com.np</p>
          </div>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-sm mb-3 uppercase tracking-wider text-outline">Retail Categories</h4>
          <ul className="space-y-2 text-xs text-on-surface-variant">
            <li><Link href="/c/hair-straighteners" className="hover:text-gold transition-colors">Hair Straighteners & Crimpers</Link></li>
            <li><Link href="/c/hair-dryers" className="hover:text-gold transition-colors">Professional Blow Dryers</Link></li>
            <li><Link href="/c/hair-curlers" className="hover:text-gold transition-colors">Curling Wands & Tongs</Link></li>
            <li><Link href="/c/hair-trimmers" className="hover:text-gold transition-colors">Clippers & Trimmers</Link></li>
            <li><Link href="/c/styling-accessories" className="hover:text-gold transition-colors">Brushes, Combs & Scissors</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-sm mb-3 uppercase tracking-wider text-outline">Salon B2B Hub</h4>
          <ul className="space-y-2 text-xs text-on-surface-variant">
            <li><Link href="/salon/portal" className="hover:text-gold transition-colors font-semibold text-on-surface">Salon Partner Portal Login</Link></li>
            <li><Link href="/c/salon-furniture-equipment" className="hover:text-gold transition-colors">Barber Chairs & Styling Stations</Link></li>
            <li><Link href="/c/salon-furniture-equipment" className="hover:text-gold transition-colors">Shampoo Basins & Pedicure Tubs</Link></li>
            <li><Link href="/salon" className="hover:text-gold transition-colors">Apply for B2B Wholesale Tier</Link></li>
            <li><Link href="/admin" className="hover:text-gold transition-colors text-outline">Staff Operations Admin</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-serif font-semibold text-sm mb-3 uppercase tracking-wider text-outline">Accepted Nepal Payments</h4>
          <p className="text-xs text-on-surface-variant mb-4">
            Cash on Delivery (COD), eSewa, Khalti, Fonepay QR, and direct Nepal Bank Transfer.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="px-2.5 py-1 bg-surface rounded border border-outline-variant">🇳🇵 Cash on Delivery</span>
            <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded border border-green-200">eSewa</span>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded border border-purple-200">Khalti</span>
            <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded border border-red-200">Fonepay</span>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200">Bank Transfer</span>
          </div>
        </div>
      </div>

      <div className="border-t border-outline-variant/60 py-6 text-center text-xs text-outline bg-surface-lowest">
        <p>© {new Date().getFullYear()} Eternity Products Nepal. All rights reserved. Prices in NPR (VAT 13% Inclusive).</p>
      </div>
    </footer>
  );
};
