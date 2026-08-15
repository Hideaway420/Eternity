"use client";

import React, { useState } from "react";
import { Palette, Sparkles } from "lucide-react";

interface ColorOption {
  name: string;
  hex: string;
  image: string;
  description: string;
}

const REAL_COLOR_OPTIONS: ColorOption[] = [
  {
    name: "Emerald Green & Gold",
    hex: "#1B4D3E",
    image: "/products/chair_emerald_green_1786235658712.jpg",
    description: "Deep Emerald Green leather with brushed gold hydraulic base. Premium choice for luxury Kathmandu salons.",
  },
  {
    name: "Espresso Vintage Brown",
    hex: "#4A2E1B",
    image: "/products/chair_espresso_brown_1786235685819.jpg",
    description: "Rich Espresso Brown leather with antique bronze metal accents. Classic barbershop aesthetic.",
  },
  {
    name: "Burgundy Velvet Red",
    hex: "#6B1D2F",
    image: "/products/chair_burgundy_red_1786235698852.jpg",
    description: "Royal Burgundy Red leather with polished chrome finish. High-end parlour statement piece.",
  },
];

export const InteractiveColorSection: React.FC = () => {
  const [selected, setSelected] = useState<ColorOption>(REAL_COLOR_OPTIONS[0]);

  return (
    <div className="rounded-3xl bg-surface-lowest border border-gold/40 p-5 sm:p-8 lg:p-12 shadow-soft grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
      {/* Left Info Column */}
      <div className="lg:col-span-6 space-y-4">
        <div className="inline-flex items-center space-x-2 text-gold font-bold text-[11px] sm:text-xs uppercase tracking-widest">
          <Palette className="w-4 h-4" />
          <span>Real Upholstery Color Schemes</span>
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-on-surface">
          Customize Your Salon Furniture Color Scheme
        </h2>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light">
          Top salon chains in Kathmandu match their equipment leather with interior lighting. Select a real upholstery color below to preview live studio photography:
        </p>

        {/* Real Color Swatch Selector Pills */}
        <div className="pt-2 flex flex-wrap gap-2.5">
          {REAL_COLOR_OPTIONS.map((opt) => (
            <button
              key={opt.name}
              onClick={() => setSelected(opt)}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                selected.name === opt.name
                  ? "border-gold bg-gold/15 text-on-surface shadow-gold ring-2 ring-gold scale-105"
                  : "border-outline-variant bg-surface-low text-on-surface-variant hover:border-gold/60"
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: opt.hex }}
              />
              <span>{opt.name}</span>
            </button>
          ))}
        </div>

        <div className="p-4 rounded-2xl bg-surface-low border border-outline-variant/60 text-xs space-y-1 text-on-surface-variant">
          <span className="font-bold text-gold flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Active Preview: {selected.name}
          </span>
          <p className="text-outline text-[11px]">{selected.description}</p>
        </div>
      </div>

      {/* Right Studio Photo Showcase */}
      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Active Selected Real Color Main Photo */}
        <div className="sm:col-span-2 rounded-2xl overflow-hidden aspect-[16/10] border-2 border-gold/40 shadow-elevated relative group bg-surface-lowest">
          <img
            key={selected.image}
            src={selected.image}
            alt={selected.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 animate-fadeIn"
          />
          <div className="absolute bottom-3 left-3 glass-card px-3 py-1.5 rounded-full text-xs font-bold text-on-surface border border-white/60 flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full border border-white" style={{ backgroundColor: selected.hex }} />
            <span>{selected.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
