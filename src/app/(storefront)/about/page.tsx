import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { ShieldCheck, Award, Building2, Truck, Sparkles } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 py-16 container mx-auto px-4 lg:px-8 max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <span className="text-xs uppercase tracking-widest text-gold font-bold">Authorized Nepal Importer</span>
          <h1 className="font-serif text-4xl font-bold tracking-tight">About Eternity Products</h1>
          <p className="text-sm text-on-surface-variant max-w-2xl mx-auto font-light leading-relaxed">
            Eternity Products is Nepal&apos;s premier importer and nationwide distributor of Ikonic professional hair styling tools, cosmetics, and luxury salon spa equipment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-surface-lowest border border-outline-variant space-y-3 shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center text-gold text-xl">
              ✂️
            </div>
            <h3 className="font-serif font-bold text-xl">D2C Retail Division</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              We bring high-end titanium and keratin hair straighteners, blow dryers, and curling wands directly to beauty enthusiasts across Nepal with open-box cash on delivery.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-surface-lowest border border-outline-variant space-y-3 shadow-soft">
            <div className="w-12 h-12 rounded-2xl bg-gold/15 flex items-center justify-center text-gold text-xl">
              💈
            </div>
            <h3 className="font-serif font-bold text-xl">B2B Salon Community</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              We partner directly with beauty parlours, barber shops, and spa resorts to fit out their floors with heavy-duty hydraulic chairs, shampoo basins, and facial beds.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
