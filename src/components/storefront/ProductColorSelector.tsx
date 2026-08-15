"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, CheckCircle2, Building2, ShoppingBag, MessageSquare, Flame, Sparkles, Minus, Plus, RefreshCw } from "lucide-react";
import { formatNpr } from "@/lib/money";

interface ColorVariant {
  name: string;
  hex: string;
  image: string;
  inStock: boolean;
  stockCount: number;
}

interface ProductColorSelectorProps {
  product: {
    id: string;
    sku: string;
    slug: string;
    name: string;
    price_npr: number;
    compare_at_npr?: number | null;
    line: string;
    specs?: string | null;
    imageUrl?: string | null;
  };
  categoryName?: string;
}

export const ProductColorSelector: React.FC<ProductColorSelectorProps> = ({
  product,
}) => {
  const isFurniture =
    product.line === "profit" ||
    product.name.toLowerCase().includes("chair") ||
    product.name.toLowerCase().includes("bed") ||
    product.name.toLowerCase().includes("basin") ||
    product.name.toLowerCase().includes("station") ||
    product.name.toLowerCase().includes("trolley");

  const hasDarazAnchor = !!product.compare_at_npr;
  const primaryImg = product.imageUrl || (isFurniture ? "/products/ikonic_barber_chair_1786231855404.jpg" : "/products/ikonic_straightener_1786231866243.jpg");

  // Distinct Color Swatches for Furniture vs Styling Tools
  const colorVariants: ColorVariant[] = isFurniture
    ? [
        {
          name: "Emerald Green & Gold",
          hex: "#1B4D3E",
          image: primaryImg.includes("http") ? primaryImg : "/products/chair_emerald_green_1786235658712.jpg",
          inStock: true,
          stockCount: 3,
        },
        {
          name: "Obsidian Black & Chrome",
          hex: "#1A1A1A",
          image: "/products/chair_obsidian_black_1786235672157.jpg",
          inStock: true,
          stockCount: 5,
        },
        {
          name: "Espresso Vintage Brown",
          hex: "#4A2E1B",
          image: "/products/chair_espresso_brown_1786235685819.jpg",
          inStock: true,
          stockCount: 2,
        },
        {
          name: "Burgundy Velvet Red",
          hex: "#6B1D2F",
          image: "/products/chair_burgundy_red_1786235698852.jpg",
          inStock: false,
          stockCount: 0,
        },
      ]
    : [
        {
          name: "Matte Charcoal & Gold",
          hex: "#2B2C2C",
          image: primaryImg,
          inStock: true,
          stockCount: 12,
        },
        {
          name: "Rose Gold Edition",
          hex: "#B76E79",
          image: "https://www.ikonicworld.com/cdn/shop/files/8904231015937_1_702816a3-41c8-4c88-92b3-ab4c7779920f.jpg",
          inStock: true,
          stockCount: 8,
        },
        {
          name: "Titanium Silver Pro",
          hex: "#C0C0C0",
          image: "https://www.ikonicworld.com/cdn/shop/files/8904231093140_1_6594bc6f-a625-47f5-863b-04f017f8c9a8.jpg",
          inStock: true,
          stockCount: 6,
        },
      ];

  const [selectedColor, setSelectedColor] = useState<ColorVariant>(colorVariants[0]);
  const [selectedImage, setSelectedImage] = useState<string>(primaryImg);
  const [quantity, setQuantity] = useState<number>(1);
  const [imageLoading, setImageLoading] = useState<boolean>(false);

  const handleColorChange = (variant: ColorVariant) => {
    setImageLoading(true);
    setSelectedColor(variant);
    setSelectedImage(variant.image);
    setTimeout(() => setImageLoading(false), 250);
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Eternity Products Nepal! I would like to order ${quantity}x "${product.name}" (${selectedColor.name}) for NPR ${formatNpr(
      product.price_npr * quantity
    )} with Open-Box Cash on Delivery.`
  );
  const whatsappUrl = `https://wa.me/9779868089892?text=${whatsappMessage}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Dynamic Gallery Showcase with Motion Effects */}
      <div className="lg:col-span-6 space-y-4">
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface-lowest border-2 border-gold/40 shadow-elevated group">
          <img
            key={selectedImage}
            src={selectedImage}
            alt={`${product.name} - ${selectedColor.name}`}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoading ? "opacity-40 blur-sm" : "opacity-100 blur-0 animate-fadeIn"
            }`}
          />
          
          {/* Active Color Badge Overlay */}
          <div className="absolute top-4 left-4 glass-card px-3.5 py-1.5 rounded-full text-xs font-bold text-on-surface border border-outline-variant flex items-center space-x-2 shadow-soft">
            <span className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: selectedColor.hex }} />
            <span>Finish: <strong className="text-gold font-serif">{selectedColor.name}</strong></span>
          </div>

          {/* CRO Urgency Badge */}
          <div className="absolute top-4 right-4 bg-gold text-on-surface px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Official Ikonic Nepal</span>
          </div>
        </div>

        {/* Thumbnail Swatch Selector */}
        <div className="flex gap-3 pt-2 overflow-x-auto pb-2">
          {colorVariants.map((v) => (
            <button
              key={v.name}
              onClick={() => handleColorChange(v)}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex flex-col items-center justify-center flex-shrink-0 ${
                selectedColor.name === v.name
                  ? "border-gold ring-4 ring-gold/30 scale-105 shadow-gold"
                  : "border-outline-variant opacity-75 hover:opacity-100"
              }`}
            >
              <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: v.hex }} />
            </button>
          ))}
        </div>
      </div>

      {/* Product Purchasing & CRO Conversion Panel */}
      <div className="lg:col-span-6 space-y-6">
        <div>
          <span className="text-xs font-mono text-outline uppercase tracking-widest block mb-1">
            Ikonic • SKU: {product.sku}
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-on-surface">
            {product.name}
          </h1>
        </div>

        {/* Price & Savings Anchor Block (CRO) */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2">
          <div className="flex items-baseline space-x-3">
            <span className="text-2xl sm:text-3xl font-bold font-sans text-on-surface">
              {formatNpr(product.price_npr * quantity)}
            </span>
            {hasDarazAnchor && (
              <span className="text-xs sm:text-sm font-mono text-outline line-through">
                Daraz: {formatNpr(product.compare_at_npr! * quantity)}
              </span>
            )}
            <span className="text-xs text-outline">(VAT 13% Inclusive)</span>
          </div>
          {hasDarazAnchor && (
            <div className="text-xs text-green-700 font-semibold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" />
              Save up to 15% vs Daraz price with 1-Year Local Replacement Guarantee!
            </div>
          )}
        </div>

        {/* Color Swatch Picker */}
        <div className="p-5 rounded-2xl bg-surface-lowest border border-outline-variant space-y-4 shadow-soft">
          <div className="flex justify-between items-center text-xs">
            <span className="font-serif font-bold text-xs sm:text-sm text-on-surface uppercase tracking-wider">
              {isFurniture ? "1. Select Upholstery Finish:" : "1. Select Color Edition:"}
            </span>
            <span className="font-bold text-gold font-mono">{selectedColor.name}</span>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            {colorVariants.map((v) => (
              <button
                key={v.name}
                onClick={() => handleColorChange(v)}
                className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  selectedColor.name === v.name
                    ? "border-gold bg-gold/15 text-on-surface shadow-gold ring-2 ring-gold scale-[1.02]"
                    : "border-outline-variant bg-surface-low text-on-surface-variant hover:border-gold/60"
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-white shadow-sm flex-shrink-0" style={{ backgroundColor: v.hex }} />
                <span>{v.name}</span>
                {!v.inStock && <span className="text-[10px] text-red-600 font-bold ml-1">(Pre-Order)</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Quantity Selector */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-lowest border border-outline-variant">
          <span className="text-xs font-bold text-outline uppercase tracking-wider">Quantity:</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg bg-surface-low hover:bg-gold/20 border border-outline-variant flex items-center justify-center text-on-surface font-bold transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono font-bold text-sm min-w-[24px] text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg bg-surface-low hover:bg-gold/20 border border-outline-variant flex items-center justify-center text-on-surface font-bold transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Urgency & Social Proof Trigger (CRO) */}
        <div className="flex items-center space-x-2 text-xs font-semibold p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800">
          <Flame className="w-4 h-4 text-amber-600 flex-shrink-0 animate-bounce" />
          <span>High Demand: {selectedColor.stockCount} units remaining in Kathmandu warehouse for instant dispatch!</span>
        </div>

        {/* Authenticity Guarantee Box */}
        <div className="rounded-2xl bg-gold/10 border-2 border-gold/40 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center space-x-2 text-gold font-bold text-xs sm:text-sm uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
            <span>असली उत्पादन Promise (Open-Box Inspection)</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Direct import from Ikonic India. Serialized box seal + Eternity warranty card included. Open outer box to inspect before paying cash on delivery.
          </p>
        </div>

        {/* High-Converting CTA Action Buttons (CRO) */}
        <div className="space-y-3 pt-1">
          {/* Primary Action Button */}
          {isFurniture ? (
            <Link
              href="/salon/portal"
              className="w-full py-4 rounded-xl bg-inverse-surface text-white font-bold text-xs sm:text-sm hover:bg-neutral-800 transition-colors flex justify-center items-center space-x-2 shadow-soft"
            >
              <Building2 className="w-4 h-4 text-gold" />
              <span className="text-white font-bold">Request Custom B2B Quote for {selectedColor.name}</span>
            </Link>
          ) : (
            <Link
              href="/checkout"
              className="w-full py-4 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs sm:text-sm transition-all flex justify-center items-center space-x-2 shadow-gold group"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Buy Now — Open-Box Cash on Delivery</span>
            </Link>
          )}

          {/* WhatsApp Direct Order Button (CRO) */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm transition-colors flex justify-center items-center space-x-2 shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Order Directly via WhatsApp (+977 9868089892)</span>
          </a>
        </div>

        {/* Delivery Estimator */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-low border border-outline-variant/60 space-y-3 text-xs">
          <h4 className="font-serif font-bold text-sm flex items-center">
            <Truck className="w-4 h-4 mr-2 text-gold" /> Nepal Nationwide Fast Delivery
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 bg-surface-lowest rounded-xl border border-outline-variant/60">
              <span className="font-bold block text-on-surface">Kathmandu Valley</span>
              <span className="text-outline block text-[11px]">1-2 Business Days</span>
              <span className="font-semibold text-green-700 block mt-1">NPR 150 (Free &gt; 5,000)</span>
            </div>
            <div className="p-3 bg-surface-lowest rounded-xl border border-outline-variant/60">
              <span className="font-bold block text-on-surface">Outside Valley</span>
              <span className="text-outline block text-[11px]">3-5 Business Days</span>
              <span className="font-semibold text-on-surface block mt-1">NPR 350 Courier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
