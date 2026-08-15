"use client";

import React, { useState } from "react";
import { MessageSquare, X, Send, Sparkles, ShieldCheck } from "lucide-react";

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");

  const officialWhatsAppNumber = "9779868089892";

  const handleOpenWhatsApp = (text?: string) => {
    const message = text || customMsg || "Hi Eternity Products Nepal! I have an inquiry about your salon tools and luxury chairs.";
    const url = `https://wa.me/${officialWhatsAppNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 flex flex-col items-end">
      {/* Interactive Popup Modal Card */}
      {isOpen && (
        <div className="mb-3 w-[300px] sm:w-[360px] rounded-3xl bg-surface-lowest border-2 border-gold/40 shadow-elevated p-4 sm:p-5 animate-in slide-in-from-bottom duration-200 text-on-surface glass-card relative overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-3.5 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 rounded-t-3xl flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-xs sm:text-sm leading-tight">Eternity WhatsApp Support</h4>
                <span className="text-[10px] text-green-100 font-semibold block">Online • Direct Contact Nepal</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="bg-surface-low p-3 rounded-2xl border border-outline-variant text-xs text-on-surface-variant leading-relaxed">
              👋 <strong>Namaste!</strong> Need assistance with product ordering, 5% Limited Offer, or salon fit-out quotes? Speak directly with Eternity Products on WhatsApp.
            </div>

            {/* Pre-set Quick Questions */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-bold text-gold tracking-wider block">Quick Inquiries:</span>
              <button
                onClick={() => handleOpenWhatsApp("Hi Eternity Nepal! I want to order Eternity Luxury Salon Chair (NPR 35,000) with 5% OFF deal.")}
                className="w-full text-left p-2 rounded-xl bg-surface-low hover:bg-gold/15 border border-outline-variant hover:border-gold/40 text-[11px] font-medium transition-all text-on-surface flex items-center justify-between group"
              >
                <span>🪑 Order Luxury Chair (NPR 35,000)</span>
                <Sparkles className="w-3 h-3 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => handleOpenWhatsApp("Hi Eternity Nepal! I need a quote for Luxury Pedicure Spa Chairs & Foot Basins.")}
                className="w-full text-left p-2 rounded-xl bg-surface-low hover:bg-gold/15 border border-outline-variant hover:border-gold/40 text-[11px] font-medium transition-all text-on-surface flex items-center justify-between group"
              >
                <span>🦶 Pedicure Spa Chair Quote</span>
                <Sparkles className="w-3 h-3 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => handleOpenWhatsApp("Hi Eternity Nepal! I want to verify serial number for warranty on my Ikonic tool.")}
                className="w-full text-left p-2 rounded-xl bg-surface-low hover:bg-gold/15 border border-outline-variant hover:border-gold/40 text-[11px] font-medium transition-all text-on-surface flex items-center justify-between group"
              >
                <span>🛡️ Verify Product Serial / Warranty</span>
                <ShieldCheck className="w-3 h-3 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Custom Input */}
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-surface-lowest border border-outline-variant focus:outline-none focus:ring-2 focus:ring-gold text-on-surface"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleOpenWhatsApp();
                }}
              />
              <button
                onClick={() => handleOpenWhatsApp()}
                className="px-3.5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs flex items-center justify-center transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center space-x-2 px-4 py-3 rounded-full bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-elevated hover:shadow-gold transition-all duration-300 transform hover:scale-105 border-2 border-white/80"
        aria-label="Contact via WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageSquare className="w-4 h-4 fill-white" />
        <span className="hidden sm:inline font-bold">Chat on WhatsApp</span>
      </button>
    </div>
  );
};
