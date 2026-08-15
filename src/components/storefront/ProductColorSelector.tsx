"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, Truck, CheckCircle2, Building2, ShoppingBag, MessageSquare, Flame, Sparkles, Minus, Plus, Tag, Check, Calendar, Lock } from "lucide-react";
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
    description?: string | null;
    priceRange?: string | null;
    offerText?: string | null;
    offerExpiry?: string | null;
    isLimitedEdition?: boolean;
    isSpaCategory?: boolean;
  };
  categoryName?: string;
}

export const ProductColorSelector: React.FC<ProductColorSelectorProps> = ({
  product,
}) => {
  const isSpaCategory =
    product.isSpaCategory ||
    product.slug.includes("spa") ||
    product.slug.includes("pedicure") ||
    product.slug.includes("recliner") ||
    product.slug.includes("signature-series");

  const isFurniture =
    isSpaCategory ||
    product.line === "profit" ||
    product.name.toLowerCase().includes("chair") ||
    product.name.toLowerCase().includes("bed") ||
    product.name.toLowerCase().includes("basin");

  // Custom Color Match Add-On (+NPR 6,000)
  const [hasCustomColorMatch, setHasCustomColorMatch] = useState<boolean>(false);
  const CUSTOM_COLOR_ADDON_NPR = 600000; // 6,000 NPR in Paisa

  const basePriceNpr = product.price_npr;
  const currentUnitPriceNpr = basePriceNpr + (hasCustomColorMatch ? CUSTOM_COLOR_ADDON_NPR : 0);

  // Calculate 15% Upfront Booking Deposit for Spa Chairs
  const depositPercentage = 15;
  const depositAmountNpr = Math.round(currentUnitPriceNpr * (depositPercentage / 100));

  const originalComparePrice = product.compare_at_npr || Math.round(product.price_npr * 1.087);
  const savingsNpr = Math.round((originalComparePrice - product.price_npr) / 100);

  const primaryImg = product.imageUrl || (isFurniture ? "/products/spa_chair_classic.jpg" : "/products/ikonic_straightener_1786231866243.jpg");

  // Real Color Swatches
  const colorVariants: ColorVariant[] = isSpaCategory
    ? [
        {
          name: "Signature Obsidian Black",
          hex: "#1A1A1A",
          image: primaryImg,
          inStock: true,
          stockCount: 3,
        },
        {
          name: "Blush Pink Velvet",
          hex: "#E8C5C8",
          image: "/products/spa_chair_pink_recliner.jpg",
          inStock: true,
          stockCount: 2,
        },
        {
          name: "Imperial White & Gold",
          hex: "#F5F5F0",
          image: "/products/spa_chair_signature.jpg",
          inStock: true,
          stockCount: 2,
        },
      ]
    : isFurniture
    ? [
        {
          name: "Emerald Green & Gold",
          hex: "#1B4D3E",
          image: "/products/chair_emerald_green_1786235658712.jpg",
          inStock: true,
          stockCount: 4,
        },
        {
          name: "Espresso Vintage Brown",
          hex: "#4A2E1B",
          image: "/products/chair_espresso_brown_1786235685819.jpg",
          inStock: true,
          stockCount: 3,
        },
        {
          name: "Burgundy Velvet Red",
          hex: "#6B1D2F",
          image: "/products/chair_burgundy_red_1786235698852.jpg",
          inStock: true,
          stockCount: 2,
        },
      ]
    : [
        {
          name: "Rose Gold Titanium",
          hex: "#B76E79",
          image: "https://www.ikonicworld.com/cdn/shop/files/8904231015937_1_702816a3-41c8-4c88-92b3-ab4c7779920f.jpg",
          inStock: true,
          stockCount: 15,
        },
        {
          name: "Matte Charcoal Pro",
          hex: "#2B2C2C",
          image: primaryImg.includes("http") ? primaryImg : "/products/ikonic_straightener_1786231866243.jpg",
          inStock: true,
          stockCount: 10,
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
    setTimeout(() => setImageLoading(false), 200);
  };

  const totalOrderNpr = currentUnitPriceNpr * quantity;
  const totalDepositNpr = depositAmountNpr * quantity;

  const whatsappMessage = encodeURIComponent(
    `Hi Eternity Products Nepal! I would like to reserve ${quantity}x "${product.name}" (${selectedColor.name})${
      hasCustomColorMatch ? " with Custom Color Match (+NPR 6,000)" : ""
    } for Total ${formatNpr(totalOrderNpr)} (Upfront 15% Booking Deposit: ${formatNpr(totalDepositNpr)}).`
  );
  const whatsappUrl = `https://wa.me/9779868089892?text=${whatsappMessage}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
      {/* Dynamic Gallery Showcase with Real Photo */}
      <div className="lg:col-span-6 space-y-4">
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-surface-lowest border-2 border-gold/40 shadow-elevated group">
          <img
            key={selectedImage}
            src={selectedImage}
            alt={`${product.name} - ${selectedColor.name}`}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              imageLoading ? "opacity-40 blur-sm" : "opacity-100 blur-0 animate-fadeIn"
            }`}
          />
          
          {/* Active Color Badge Overlay */}
          <div className="absolute top-4 left-4 glass-card px-3.5 py-1.5 rounded-full text-xs font-bold text-on-surface border border-outline-variant flex items-center space-x-2 shadow-soft">
            <span className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: selectedColor.hex }} />
            <span>Finish: <strong className="text-gold font-serif">{selectedColor.name}</strong></span>
          </div>

          {/* Offer / Limited Stock Badges Overlay */}
          {product.offerText && (
            <div className="absolute top-4 right-4 bg-red-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center space-x-1.5 animate-pulse">
              <Tag className="w-3.5 h-3.5" />
              <span>{product.offerText}</span>
            </div>
          )}

          {product.isLimitedEdition && (
            <div className="absolute top-4 right-4 bg-amber-600 text-white px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>STRICTLY LIMITED STOCK</span>
            </div>
          )}
        </div>

        {/* Real Color Thumbnails */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {colorVariants.map((v) => (
            <button
              key={v.name}
              onClick={() => handleColorChange(v)}
              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all flex flex-col items-center justify-center ${
                selectedColor.name === v.name
                  ? "border-gold ring-4 ring-gold/30 scale-105 shadow-gold"
                  : "border-outline-variant opacity-75 hover:opacity-100"
              }`}
            >
              <img src={v.image} alt={v.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: v.hex }} />
            </button>
          ))}
        </div>
      </div>

      {/* Product Purchasing & High-Converting Conversion Panel */}
      <div className="lg:col-span-6 space-y-6">
        <div>
          {isSpaCategory && (
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/40 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Category Price Range: {product.priceRange || "NPR 115,000 – NPR 145,000"}</span>
            </div>
          )}
          <span className="text-xs font-mono text-outline uppercase tracking-widest block mb-1">
            Eternity Luxury Spa Collection • SKU: {product.sku}
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-on-surface">
            {product.name}
          </h1>
        </div>

        {/* Product Rich Description */}
        {product.description && (
          <div className="p-4 rounded-2xl bg-surface-low border border-outline-variant/60 text-xs sm:text-sm text-on-surface-variant leading-relaxed font-light">
            {product.description}
          </div>
        )}

        {/* Pricing Block with Upfront Deposit Highlight */}
        <div className="p-5 rounded-2xl bg-surface-container-low border-2 border-gold/50 space-y-3 relative overflow-hidden shadow-soft">
          {product.offerText ? (
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gold uppercase tracking-wider flex items-center">
                <Tag className="w-3.5 h-3.5 mr-1 text-red-600" /> {product.offerText}
              </span>
              {product.offerExpiry && (
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center">
                  <Calendar className="w-3 h-3 mr-1" /> Valid until {product.offerExpiry}
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs font-bold text-gold uppercase tracking-wider">
              Bespoke Salon Fit-Out Pricing
            </div>
          )}

          <div className="flex items-baseline space-x-3">
            <span className="text-3xl sm:text-4xl font-bold font-sans text-on-surface">
              {formatNpr(totalOrderNpr)}
            </span>
            {product.compare_at_npr && (
              <span className="text-sm sm:text-base font-mono text-outline line-through">
                {formatNpr(product.compare_at_npr * quantity)}
              </span>
            )}
          </div>

          {/* 10% - 15% Upfront Booking Deposit Callout */}
          {isSpaCategory && (
            <div className="pt-2 border-t border-gold/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="text-xs font-bold text-on-surface flex items-center">
                <Lock className="w-3.5 h-3.5 mr-1.5 text-gold" />
                <span>15% Upfront Booking Deposit:</span>
              </div>
              <span className="text-sm font-bold text-gold font-sans bg-gold/15 px-3 py-1 rounded-xl border border-gold/40">
                {formatNpr(totalDepositNpr)}
              </span>
            </div>
          )}

          <div className="text-[11px] text-green-700 font-semibold flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600" />
            100% Guaranteed Official Eternity Nepal Delivery & 1-Year Replacement Warranty
          </div>
        </div>

        {/* CUSTOM SALON COLOR MATCH ADD-ON (+NPR 6,000) */}
        <div className="p-5 rounded-2xl bg-surface-lowest border-2 border-gold/40 space-y-3 shadow-soft">
          <div className="flex justify-between items-center">
            <span className="font-serif font-bold text-xs sm:text-sm text-on-surface uppercase tracking-wider">
              Bespoke Customization Add-On:
            </span>
            <span className="text-xs font-bold text-gold font-mono">+NPR 6,000</span>
          </div>

          <label
            onClick={() => setHasCustomColorMatch(!hasCustomColorMatch)}
            className={`flex items-center space-x-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
              hasCustomColorMatch
                ? "border-gold bg-gold/15 text-on-surface shadow-gold ring-2 ring-gold"
                : "border-outline-variant bg-surface-low text-on-surface-variant hover:border-gold/60"
            }`}
          >
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
              hasCustomColorMatch ? "bg-gold border-gold text-on-surface" : "border-outline-variant bg-surface-lowest"
            }`}>
              {hasCustomColorMatch && <Check className="w-3.5 h-3.5 text-on-surface stroke-[3]" />}
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm block">Custom Salon Color Match (+NPR 6,000)</span>
              <span className="text-[11px] text-outline block">Align upholstery color perfectly with your salon&apos;s interior brand palette.</span>
            </div>
          </label>
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

        {/* Urgency & Social Proof Trigger */}
        <div className="flex items-center space-x-2 text-xs font-semibold p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800">
          <Flame className="w-4 h-4 text-amber-600 flex-shrink-0 animate-bounce" />
          <span>High Demand: {selectedColor.stockCount} units remaining in Kathmandu warehouse for instant dispatch!</span>
        </div>

        {/* Booking Terms Box */}
        <div className="rounded-2xl bg-gold/10 border-2 border-gold/40 p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center space-x-2 text-gold font-bold text-xs sm:text-sm uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
            <span>Booking & Payment Terms</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {isSpaCategory
              ? `Secure your order today with a convenient 10% - 15% upfront booking payment (${formatNpr(totalDepositNpr)} deposit). The remaining balance is payable upon delivery inspection.`
              : "100% Cash on Delivery across Kathmandu Valley and all 77 districts of Nepal."}
          </p>
        </div>

        {/* High-Converting CTA Action Buttons */}
        <div className="space-y-3 pt-1">
          <Link
            href="/checkout"
            className="w-full py-4 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs sm:text-sm transition-all flex justify-center items-center space-x-2 shadow-gold group"
          >
            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>
              {isSpaCategory
                ? `Pay 15% Deposit (${formatNpr(totalDepositNpr)}) & Reserve Chair`
                : "Buy Now — Open-Box Cash on Delivery"}
            </span>
          </Link>

          {/* WhatsApp Direct Booking Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm transition-colors flex justify-center items-center space-x-2 shadow-sm"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Reserve via WhatsApp (+977 9868089892)</span>
          </a>
        </div>

        {/* Delivery Estimator */}
        <div className="p-4 sm:p-5 rounded-2xl bg-surface-low border border-outline-variant/60 space-y-3 text-xs">
          <h4 className="font-serif font-bold text-sm flex items-center">
            <Truck className="w-4 h-4 mr-2 text-gold" /> Nepal Nationwide Delivery
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="p-3 bg-surface-lowest rounded-xl border border-outline-variant/60">
              <span className="font-bold block text-on-surface">Kathmandu Valley</span>
              <span className="text-outline block text-[11px]">1-2 Business Days</span>
              <span className="font-semibold text-green-700 block mt-1">Free Delivery</span>
            </div>
            <div className="p-3 bg-surface-lowest rounded-xl border border-outline-variant/60">
              <span className="font-bold block text-on-surface">Outside Valley</span>
              <span className="text-outline block text-[11px]">3-5 Business Days</span>
              <span className="font-semibold text-on-surface block mt-1">Courier Service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
