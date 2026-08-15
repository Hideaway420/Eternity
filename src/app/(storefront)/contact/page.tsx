import React from "react";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { Phone, Mail, MapPin, MessageSquare, Clock, Video } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 py-16 container mx-auto px-4 lg:px-8 max-w-4xl space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs uppercase tracking-widest text-gold font-bold">Concierge & Client Support</span>
          <h1 className="font-serif text-4xl font-bold">Contact Eternity Products</h1>
          <p className="text-sm text-on-surface-variant font-light max-w-xl mx-auto">
            Have questions about Ikonic hair straightener models, salon equipment bulk quotes, or Kathmandu delivery status? We are here to assist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant space-y-4 shadow-soft">
              <h3 className="font-serif font-bold text-lg">Kathmandu Headquarters</h3>
              <div className="space-y-3 text-xs text-on-surface-variant">
                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gold" /> New Road, Kathmandu, Nepal</p>
                <a href="https://wa.me/9779868089892" target="_blank" rel="noreferrer" className="flex items-center hover:text-gold transition-colors font-bold">
                  <Phone className="w-4 h-4 mr-2 text-gold" /> +977 9868089892 (Call / WhatsApp)
                </a>
                <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gold" /> sales@eternityproducts.com.np</p>
                <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gold" /> Sun - Fri: 10:00 AM - 6:00 PM</p>
              </div>
            </div>

            {/* Social Channels */}
            <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant space-y-3 shadow-soft">
              <h4 className="font-serif font-bold text-sm text-on-surface">Direct Social & Support Channels</h4>
              <div className="flex flex-col gap-2">
                <a
                  href="https://wa.me/9779868089892"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-green-50 text-green-700 font-bold text-xs border border-green-200 hover:bg-green-100 transition-colors"
                >
                  <span className="flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> WhatsApp & Viber Support</span>
                  <span>+977 9868089892</span>
                </a>
                <a
                  href="https://www.tiktok.com/@eternity.products?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-neutral-900 text-white font-bold text-xs hover:bg-black transition-colors"
                >
                  <span className="flex items-center"><Video className="w-4 h-4 mr-2 text-cyan-400" /> Official TikTok Shop</span>
                  <span>@eternity.products</span>
                </a>
              </div>
            </div>
          </div>

          <form className="p-8 rounded-3xl bg-surface-lowest border border-outline-variant space-y-4 shadow-soft">
            <h3 className="font-serif font-bold text-lg">Send Concierge Message</h3>
            <div>
              <label className="block text-xs font-semibold text-outline mb-1">Your Name</label>
              <input type="text" required placeholder="Full Name" className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-outline mb-1">Phone Number</label>
              <input type="tel" required placeholder="e.g. 9868089892" className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-outline mb-1">Message / Inquiry</label>
              <textarea rows={4} placeholder="How can we help you?" className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold" />
            </div>
            <button type="submit" className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs shadow-gold transition-colors">
              Send Inquiry
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
