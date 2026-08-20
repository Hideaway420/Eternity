"use client";

import React, { useState } from "react";
import { MessageSquare } from "lucide-react";
import { isValidNepalPhone, normalizePhone } from "@/lib/phone";

const WHATSAPP_NUMBER = "9779868089892";

/**
 * ponytail: composes a WhatsApp message instead of posting to a backend.
 *
 * The previous form had no onSubmit, no action and no state - it silently discarded every
 * enquiry. Every other contact route on this site is already WhatsApp, and the owner reads
 * WhatsApp, so routing here avoids a messages table, an admin inbox and an email provider
 * for zero added reach. Swap to a real endpoint if enquiry volume ever needs an audit trail.
 */
export function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (!isValidNepalPhone(phone)) {
      setError("Please enter a valid Nepali mobile number, for example 9868089892.");
      return;
    }
    setError(null);

    const body = [
      "Enquiry from eternityproducts.online",
      `Name: ${name.trim()}`,
      `Phone: ${normalizePhone(phone)}`,
      message.trim() ? `Message: ${message.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`, "_blank", "noopener");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-8 rounded-3xl bg-surface-lowest border border-outline-variant space-y-4 shadow-soft"
    >
      <h3 className="font-serif font-bold text-lg">Send an Enquiry</h3>
      <p className="text-xs text-on-surface-variant">
        This opens WhatsApp with your message ready to send, so you get a reply on the same number.
      </p>

      <div>
        <label htmlFor="contact-name" className="block text-xs font-semibold text-outline mb-1">
          Your Name
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold"
        />
      </div>

      <div>
        <label htmlFor="contact-phone" className="block text-xs font-semibold text-outline mb-1">
          Phone Number
        </label>
        <input
          id="contact-phone"
          type="tel"
          required
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 9868089892"
          className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-xs font-semibold text-outline mb-1">
          Message / Inquiry
        </label>
        <textarea
          id="contact-message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help you?"
          className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold"
        />
      </div>

      {error && (
        <p role="alert" className="text-xs font-bold text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full min-h-[44px] py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs shadow-gold transition-colors flex items-center justify-center active:scale-[0.98]"
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Send via WhatsApp
      </button>
    </form>
  );
}
