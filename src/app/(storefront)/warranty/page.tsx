import React from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { ShieldCheck, Award, CheckCircle2, Search } from "lucide-react";

export default function WarrantyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 py-16 container mx-auto px-4 lg:px-8 max-w-3xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-gold/15 text-gold border border-gold/40 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>असली उत्पादन Serial Verification</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">Official Eternity Warranty Claim</h1>
          <p className="text-sm text-on-surface-variant font-light">
            Enter your Ikonic tool serial number from the warranty card or box hologram to verify authenticity and active 1-year replacement warranty.
          </p>
        </div>

        <div className="bg-surface-lowest p-8 rounded-3xl border border-gold/40 shadow-elevated space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">Ikonic Serial Number (e.g. IK-9842-NP)</label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter Serial Number"
                className="flex-1 bg-surface-low border border-outline-variant rounded-xl p-3 text-sm font-mono focus:outline-none focus:border-gold uppercase"
              />
              <button className="px-6 py-3 bg-gold text-on-surface font-bold text-xs rounded-xl shadow-gold hover:bg-gold-hover transition-colors">
                Verify Serial
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-surface-low border border-outline-variant/60 text-xs space-y-2">
            <h4 className="font-serif font-bold text-sm text-on-surface flex items-center">
              <CheckCircle2 className="w-4 h-4 text-gold mr-1.5" /> What does Eternity Warranty cover?
            </h4>
            <ul className="space-y-1 text-on-surface-variant list-disc list-inside">
              <li>1-Year 1-to-1 immediate replacement for heating element failure</li>
              <li>Thermostat & motor malfunction protection</li>
              <li>Free authorized service at Kathmandu service center</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
