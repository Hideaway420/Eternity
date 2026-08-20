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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in duration-200">
      {/* Near-White Search Modal Dropdown UI */}
      <div className="bg-[#FDFBF7] border border-[#E8E1D7] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl">
        {/* Search Input Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E1D7] flex items-center space-x-3 bg-[#F8F3EC]">
          <Search className="w-5 h-5 text-[#B58A18] flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search straighteners, dryers, barber chairs, SKUs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base font-bold text-[#1B1C1C] focus:outline-none placeholder-[#7A7570]"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs font-bold text-[#524F4A] hover:text-[#1B1C1C] px-2 py-1 rounded hover:bg-[#EFE7DC]"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#EFE7DC] text-[#524F4A] hover:text-[#1B1C1C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trending Tags (Shown when input is empty) */}
        {!query && (
          <div className="p-4 sm:p-5 border-b border-[#E8E1D7] bg-[#F5F0E8]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7A7570] block mb-2 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-[#B58A18]" /> Trending Searches
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => setQuery("straightener")}
                className="px-3 py-1.5 rounded-xl bg-[#F8F3EC] border border-[#E0D8CD] hover:border-[#B58A18] hover:bg-[#EFE7DC] text-[#2C2A29] transition-all font-semibold shadow-xs"
              >
                Titanium Straightener 3.0
              </button>
              <button
                onClick={() => setQuery("dryer")}
                className="px-3 py-1.5 rounded-xl bg-[#F8F3EC] border border-[#E0D8CD] hover:border-[#B58A18] hover:bg-[#EFE7DC] text-[#2C2A29] transition-all font-semibold shadow-xs"
              >
                Pro 2500+ Hair Dryer
              </button>
              <button
                onClick={() => setQuery("felix")}
                className="px-3 py-1.5 rounded-xl bg-[#F8F3EC] border border-[#E0D8CD] hover:border-[#B58A18] hover:bg-[#EFE7DC] text-[#2C2A29] transition-all font-semibold shadow-xs"
              >
                Barber Chair Felix
              </button>
              <button
                onClick={() => setQuery("shampoo")}
                className="px-3 py-1.5 rounded-xl bg-[#F8F3EC] border border-[#E0D8CD] hover:border-[#B58A18] hover:bg-[#EFE7DC] text-[#2C2A29] transition-all font-semibold shadow-xs"
              >
                Shampoo Basin IK-1254
              </button>
            </div>
          </div>
        )}

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#E8E1D7]/60 p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7A7570] space-y-4 px-4">
              <div className="w-12 h-12 rounded-full bg-[#B58A18]/15 flex items-center justify-center text-[#B58A18] mx-auto border border-[#B58A18]/30">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#1B1C1C]">No exact matches found for &quot;{query}&quot;</p>
                <p className="text-xs text-[#7A7570] font-light max-w-sm mx-auto">
                  We might not carry that specific model name yet, but explore our bestselling Ikonic hair tools and Eternity spa chairs below!
                </p>
              </div>
              <div className="pt-2 flex flex-wrap justify-center gap-2">
                <Link
                  href="/c/manicure-pedicure-spa-furniture"
                  onClick={onClose}
                  className="px-4 py-2 bg-[#B58A18] hover:bg-[#A37B15] text-[#1B1C1C] font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  Explore Spa Chairs
                </Link>
                <Link
                  href="/c/hair-straighteners"
                  onClick={onClose}
                  className="px-4 py-2 bg-[#F8F3EC] border border-[#E0D8CD] hover:border-[#B58A18] font-bold text-[#1B1C1C] rounded-xl text-xs transition-colors"
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
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F2EBE1] transition-colors group"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F8F3EC] border border-[#E0D8CD] flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-[#B58A18] font-bold uppercase tracking-wider block">
                      {item.category} • {item.sku}
                    </span>
                    <h4 className="font-serif font-bold text-xs sm:text-sm text-[#1B1C1C] group-hover:text-[#B58A18] transition-colors line-clamp-1">
                      {item.name}
                    </h4>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="font-bold text-[#1B1C1C] font-sans">{formatNpr(item.price_npr)}</span>
                  <ArrowRight className="w-4 h-4 text-[#7A7570] group-hover:text-[#B58A18] group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#F8F3EC] border-t border-[#E8E1D7] text-[11px] text-[#7A7570] flex justify-between items-center">
          <span>
            Press <kbd className="px-1.5 py-0.5 bg-[#F2EBE1] rounded border border-[#D8CFC3] font-mono text-[#1B1C1C] font-bold">ESC</kbd> to exit
          </span>
          <span className="flex items-center text-[#B58A18] font-bold">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Official Ikonic Nepal
          </span>
        </div>
      </div>
    </div>
  );
};
