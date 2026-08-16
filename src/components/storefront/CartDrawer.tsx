"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ShoppingBag, Truck, ShieldCheck, ArrowRight, Trash2, MessageSquare } from "lucide-react";
import { formatNpr } from "@/lib/money";
import { useCartStore } from "@/store/useCartStore";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Rule 1 & Rule 3: Use Zustand store actions
  const cartItems = useCartStore((state) => state.cartItems);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);

  if (!isOpen) return null;

  const totalNpr = isMounted ? cartItems.reduce((sum, item) => sum + item.price_npr * item.qty, 0) : 0;
  const totalItemCount = isMounted ? cartItems.reduce((sum, item) => sum + item.qty, 0) : 0;

  const freeShippingThreshold = 500000; // NPR 5,000 in paisa
  const neededForFreeShipping = Math.max(0, freeShippingThreshold - totalNpr);
  const freeShippingPct = Math.min(100, Math.round((totalNpr / freeShippingThreshold) * 100));

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
            <span className="text-xs bg-gold/20 text-on-surface px-2.5 py-0.5 rounded-full font-bold font-mono">
              {totalItemCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-outline hover:text-on-surface"
            aria-label="Close Shopping Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Meter */}
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
          {!isMounted || cartItems.length === 0 ? (
            <div className="py-16 text-center text-xs text-outline space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center mx-auto border border-outline-variant">
                <ShoppingBag className="w-8 h-8 text-outline/50" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-serif font-bold text-on-surface">Your cart is currently empty</p>
                <p className="text-xs text-outline font-light">Explore our Ikonic tools & Eternity spa chairs to get started.</p>
              </div>
              <Link
                href="/c/hair-straighteners"
                onClick={onClose}
                className="inline-block px-6 py-3 bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs rounded-xl shadow-gold transition-colors"
              >
                Explore Hair Tools
              </Link>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-surface-low border border-outline-variant flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-outline uppercase">{item.sku}</span>
                    <h4 className="font-serif font-bold text-xs text-on-surface line-clamp-1">{item.name}</h4>
                    {item.color && <span className="text-[11px] text-gold font-semibold block mt-0.5">{item.color}</span>}
                    <span className="text-xs font-bold text-on-surface font-sans block mt-1">
                      {formatNpr(item.price_npr * item.qty)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls & Remove Action Component */}
                <div className="flex flex-col items-end space-y-2">
                  {/* Task 4 Rule 3: Explicit Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-outline hover:text-red-600 transition-colors p-1 rounded-lg hover:bg-red-50"
                    aria-label={`Remove ${item.name} from cart`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center space-x-2 bg-surface-low p-1 rounded-lg border border-outline-variant text-xs">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-1.5 font-bold hover:text-gold transition-colors"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold">{item.qty}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-1.5 font-bold hover:text-gold transition-colors"
                    >
                      +
                    </button>
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
              className={`w-full py-3.5 rounded-xl text-on-surface font-bold text-xs transition-all flex justify-center items-center space-x-2 shadow-gold ${
                cartItems.length === 0
                  ? "bg-outline/30 text-outline cursor-not-allowed pointer-events-none"
                  : "bg-gold hover:bg-gold-hover"
              }`}
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
