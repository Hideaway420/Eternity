"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, Sparkles, ArrowRight, TrendingUp } from "lucide-react";
import { formatNpr } from "@/lib/money";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_CATALOG = [
  {
    sku: "ETP-066",
    slug: "ikonic-professional-pro-titanium-shine-3-0-hair-straightener",
    name: "Ikonic Professional Pro Titanium Shine 3.0 Hair Straightener",
    category: "Hair Straighteners",
    price_npr: 1292000,
    imageUrl: "https://www.ikonicworld.com/cdn/shop/files/8904231015937_1_702816a3-41c8-4c88-92b3-ab4c7779920f.jpg",
  },
  {
    sku: "ETP-095",
    slug: "ikonic-professional-pro-2500-advanced-hair-dryer",
    name: "Ikonic Professional Pro 2500+ Advanced Hair Dryer",
    category: "Hair Dryers",
    price_npr: 1000000,
    imageUrl: "/products/ikonic_blow_dryer_1786231888743.jpg",
  },
  {
    sku: "ETP-067",
    slug: "ikonic-professional-gleam-pro-hair-straightener",
    name: "Ikonic Professional Gleam Pro Hair Straightener",
    category: "Hair Straighteners",
    price_npr: 1376000,
    imageUrl: "/products/ikonic_straightener_1786231866243.jpg",
  },
  {
    sku: "ETP-089",
    slug: "ikonic-professional-id-2-0-hair-dryer",
    name: "Ikonic Professional Id 2.0 Hair Dryer",
    category: "Hair Dryers",
    price_npr: 2622000,
    imageUrl: "https://www.ikonicworld.com/cdn/shop/files/8904231093140_1_6594bc6f-a625-47f5-863b-04f017f8c9a8.jpg",
  },
  {
    sku: "ETP-005",
    slug: "ikonic-barber-chair-felix",
    name: "Ikonic Barber Chair Felix",
    category: "Salon Furniture",
    price_npr: 19515000,
    imageUrl: "https://www.ikonicworld.com/cdn/shop/files/Felix-IK-8781_1.jpg",
  },
  {
    sku: "ETP-002",
    slug: "autumn-electric-bed",
    name: "Autumn Electric Spa Bed",
    category: "Salon Furniture",
    price_npr: 18800000,
    imageUrl: "https://www.ikonicworld.com/cdn/shop/files/IK-3818ELECTRICALBEDBLACK_CHALET.jpg",
  },
  {
    sku: "ETP-009",
    slug: "shampoo-station-chair-ik-1254",
    name: "Ikonic Shampoo Station Chair IK-1254",
    category: "Salon Furniture",
    price_npr: 14880000,
    imageUrl: "https://www.ikonicworld.com/cdn/shop/files/IK-1254_Ikonic.jpg",
  },
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open
          const btn = document.getElementById("search-modal-trigger");
          if (btn) btn.click();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = SEARCH_CATALOG.filter((item) => {
    const q = query.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
      <div className="bg-surface-lowest border border-outline-variant rounded-3xl max-w-2xl w-full overflow-hidden shadow-elevated">
        {/* Search Input Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant flex items-center space-x-3 bg-surface-low">
          <Search className="w-5 h-5 text-gold flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search straighteners, dryers, barber chairs, SKUs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base font-medium text-on-surface focus:outline-none placeholder-outline"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs font-bold text-outline hover:text-on-surface">
              Clear
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trending Tags (Shown when input is empty) */}
        {!query && (
          <div className="p-4 sm:p-5 border-b border-outline-variant bg-surface-container-low/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-outline block mb-2 flex items-center">
              <TrendingUp className="w-3 h-3 mr-1 text-gold" /> Trending Searches
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setQuery("straightener")}
                className="px-3 py-1.5 rounded-xl bg-surface-low border border-outline-variant hover:border-gold text-on-surface transition-colors font-medium"
              >
                Titanium Straightener 3.0
              </button>
              <button
                onClick={() => setQuery("dryer")}
                className="px-3 py-1.5 rounded-xl bg-surface-low border border-outline-variant hover:border-gold text-on-surface transition-colors font-medium"
              >
                Pro 2500+ Hair Dryer
              </button>
              <button
                onClick={() => setQuery("felix")}
                className="px-3 py-1.5 rounded-xl bg-surface-low border border-outline-variant hover:border-gold text-on-surface transition-colors font-medium"
              >
                Barber Chair Felix
              </button>
              <button
                onClick={() => setQuery("shampoo")}
                className="px-3 py-1.5 rounded-xl bg-surface-low border border-outline-variant hover:border-gold text-on-surface transition-colors font-medium"
              >
                Shampoo Basin IK-1254
              </button>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-outline-variant/60 p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-outline space-y-4 px-4">
              <div className="w-12 h-12 rounded-full bg-gold/15 flex items-center justify-center text-gold mx-auto border border-gold/30">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-on-surface">No exact matches found for &quot;{query}&quot;</p>
                <p className="text-xs text-outline font-light max-w-sm mx-auto">
                  We might not carry that specific model name yet, but explore our bestselling Ikonic hair tools and Eternity spa chairs below!
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <Link
                  href="/c/spa"
                  onClick={onClose}
                  className="px-4 py-2 bg-gold hover:bg-gold-hover text-on-surface font-bold rounded-xl text-xs shadow-gold transition-colors"
                >
                  Explore Spa Chairs
                </Link>
                <Link
                  href="/c/hair-straighteners"
                  onClick={onClose}
                  className="px-4 py-2 bg-surface-low border border-outline-variant hover:border-gold font-bold text-on-surface rounded-xl text-xs transition-colors"
                >
                  View Hair Straighteners
                </Link>
              </div>
            </div>
          ) : (
            results.map((item) => (
              <Link
                key={item.sku}
                href={`/p/${item.slug}`}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-surface-low transition-colors group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-low border border-outline-variant flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-gold uppercase">{item.category} • {item.sku}</span>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-on-surface group-hover:text-gold transition-colors line-clamp-1">
                      {item.name}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-bold text-on-surface font-sans">{formatNpr(item.price_npr)}</span>
                  <ArrowRight className="w-4 h-4 text-outline group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-surface-low border-t border-outline-variant text-[11px] text-outline flex justify-between items-center">
          <span>Press <kbd className="px-1.5 py-0.5 bg-surface-container rounded border border-outline-variant font-mono">ESC</kbd> to exit</span>
          <span className="flex items-center text-gold font-bold"><Sparkles className="w-3 h-3 mr-1" /> Official Ikonic Nepal</span>
        </div>
      </div>
    </div>
  );
};
