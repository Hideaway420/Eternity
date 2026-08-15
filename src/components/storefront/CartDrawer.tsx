"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, ShoppingBag, Truck, ShieldCheck, ArrowRight, Trash2, MessageSquare } from "lucide-react";
import { formatNpr } from "@/lib/money";

interface CartItem {
  id: string;
  sku: string;
  name: string;
  color: string;
  price_npr: number;
  qty: number;
  imageUrl: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: "cart-1",
    sku: "ETP-066",
    name: "Ikonic Professional Pro Titanium Shine 3.0 Hair Straightener",
    color: "Matte Charcoal & Gold",
    price_npr: 1292000,
    qty: 1,
    imageUrl: "https://www.ikonicworld.com/cdn/shop/files/8904231015937_1_702816a3-41c8-4c88-92b3-ab4c7779920f.jpg",
  },
];

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<CartItem[]>(DEFAULT_CART_ITEMS);

  if (!isOpen) return null;

  const totalNpr = items.reduce((sum, item) => sum + item.price_npr * item.qty, 0);
  const freeShippingThreshold = 500000; // NPR 5,000 in paisa
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - totalNpr);
  const freeShippingPct = Math.min(100, Math.round((totalNpr / freeShippingThreshold) * 100));

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const whatsappMessage = encodeURIComponent(
    `Hi Eternity Products Nepal! I would like to place an order for items totaling NPR ${formatNpr(
      totalNpr
    )} via Open-Box Cash on Delivery.`
  );
  const whatsappUrl = `https://wa.me/9779868089892?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
      <div className="bg-surface-lowest border-l border-outline-variant w-full max-w-md h-full flex flex-col justify-between shadow-elevated animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-low">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-gold" />
            <h2 className="font-serif font-bold text-lg text-on-surface">Your Shopping Cart</h2>
            <span className="text-xs bg-gold/20 text-on-surface px-2 py-0.5 rounded-full font-bold">
              {items.length}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter (CRO) */}
        <div className="p-4 bg-surface-container-low border-b border-outline-variant/60 text-xs space-y-2">
          <div className="flex justify-between items-center font-semibold">
            <span className="flex items-center text-on-surface">
              <Truck className="w-4 h-4 mr-1.5 text-gold" />
              {neededForFreeShipping === 0
                ? "🎉 You qualified for FREE Kathmandu Valley Delivery!"
                : `Add ${formatNpr(neededForFreeShipping)} more for FREE Delivery!`}
            </span>
            <span className="font-bold text-gold font-mono">{freeShippingPct}%</span>
          </div>
          <div className="h-2 w-full bg-surface-low rounded-full overflow-hidden border border-outline-variant/60">
            <div className="h-full bg-gold transition-all duration-500" style={{ width: `${freeShippingPct}%` }} />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-outline-variant/60">
          {items.length === 0 ? (
            <div className="py-16 text-center text-xs text-outline space-y-3">
              <ShoppingBag className="w-10 h-10 mx-auto text-outline/50" />
              <p className="text-sm font-semibold text-on-surface">Your cart is currently empty</p>
              <Link href="/c/hair-straighteners" onClick={onClose} className="inline-block px-4 py-2 bg-gold text-on-surface font-bold text-xs rounded-xl">
                Explore Hair Tools
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-low border border-outline-variant flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-outline uppercase">{item.sku}</span>
                    <h4 className="font-serif font-bold text-xs text-on-surface line-clamp-1">{item.name}</h4>
                    <span className="text-[11px] text-gold font-semibold block mt-0.5">{item.color}</span>
                    <span className="text-xs font-bold text-on-surface font-sans block mt-1">
                      {formatNpr(item.price_npr * item.qty)}
                    </span>
                  </div>
                </div>

                {/* Quantity Buttons */}
                <div className="flex flex-col items-end space-y-2">
                  <button onClick={() => updateQty(item.id, -item.qty)} className="text-outline hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center space-x-2 bg-surface-low p-1 rounded-lg border border-outline-variant text-xs">
                    <button onClick={() => updateQty(item.id, -1)} className="px-1.5 font-bold hover:text-gold">-</button>
                    <span className="font-mono font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="px-1.5 font-bold hover:text-gold">+</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer & Checkout Action */}
        <div className="p-5 border-t border-outline-variant bg-surface-low space-y-3">
          <div className="flex justify-between items-baseline text-sm font-bold">
            <span className="text-on-surface">Subtotal (VAT 13% Incl.):</span>
            <span className="text-xl font-sans text-on-surface">{formatNpr(totalNpr)}</span>
          </div>

          <div className="space-y-2">
            <Link
              href="/checkout"
              onClick={onClose}
              className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs transition-colors flex justify-center items-center space-x-2 shadow-gold"
            >
              <span>Proceed to 1-Page Express Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs transition-colors flex justify-center items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Order via WhatsApp (+977 9868089892)</span>
            </a>
          </div>

          <div className="pt-2 text-[10px] text-outline text-center flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>Open-Box Cash on Delivery Guarantee Across Nepal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
