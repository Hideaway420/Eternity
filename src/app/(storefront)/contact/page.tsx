import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { ContactForm } from "@/components/storefront/ContactForm";
import { Phone, Mail, MapPin, MessageSquare, Clock, Video, Navigation } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us in Kathmandu",
  description:
    "Call, WhatsApp or visit Eternity Products at New Road, Kathmandu. Salon chair and spa furniture enquiries, bulk parlour quotes and delivery updates. Sunday to Friday, 10am to 6pm.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Eternity Products | Kathmandu Showroom",
    description: "New Road, Kathmandu. Call or WhatsApp +977 9868089892. Sunday to Friday, 10am to 6pm.",
    url: "/contact",
    siteName: "Eternity Products",
    locale: "en_NP",
    type: "website",
  },
};

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
                <a href="tel:+9779868089892" className="flex items-center min-h-[44px] hover:text-gold transition-colors font-bold">
                  <Phone className="w-4 h-4 mr-2 text-gold" /> +977 9868089892 (Tap to call)
                </a>
                <a href="https://wa.me/9779868089892" target="_blank" rel="noreferrer" className="flex items-center min-h-[44px] hover:text-gold transition-colors font-bold">
                  <MessageSquare className="w-4 h-4 mr-2 text-gold" /> Message on WhatsApp / Viber
                </a>
                <a href="mailto:sales@eternityproducts.com.np" className="flex items-center min-h-[44px] hover:text-gold transition-colors">
                  <Mail className="w-4 h-4 mr-2 text-gold" /> sales@eternityproducts.com.np
                </a>
                <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gold" /> Sun - Fri: 10:00 AM - 6:00 PM</p>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=New+Road%2C+Kathmandu%2C+Nepal"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center min-h-[44px] hover:text-gold transition-colors font-bold"
                >
                  <Navigation className="w-4 h-4 mr-2 text-gold" /> Get directions to the showroom
                </a>
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

          <ContactForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
