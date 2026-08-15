"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { ShieldCheck, Truck, CreditCard, CheckCircle2, Phone, Sparkles, MapPin, Building, PackageCheck } from "lucide-react";
import { formatNpr } from "@/lib/money";

const NEPAL_DISTRICTS = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara (Kaski)", "Chitwan", "Rupandehi (Butwal)",
  "Morang (Biratnagar)", "Sunsari (Dharan)", "Jhapa", "Kaski", "Parsa (Birgunj)",
  "Kavrepalanchok", "Nuwakot", "Makwanpur (Hetauda)", "Banke (Nepalgunj)", "Other District"
];

export default function CheckoutPage() {
  const [phone, setPhone] = useState("");
  const [recipient, setRecipient] = useState("");
  const [district, setDistrict] = useState("Kathmandu");
  const [city, setCity] = useState("");
  const [landmark, setLandmark] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "esewa" | "khalti" | "bank">("cod");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNum, setPlacedOrderNum] = useState("");

  const isValley = district === "Kathmandu" || district === "Lalitpur" || district === "Bhaktapur";
  const deliveryNpr = isValley ? 15000 : 35000; // Paisa (NPR 150 vs NPR 350)
  const itemSubtotalNpr = 1292000; // Paisa (NPR 12,920 sample straightener)
  const totalNpr = itemSubtotalNpr + deliveryNpr;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrderNum = `ETP-${Math.floor(100000 + Math.random() * 900000)}`;
    setPlacedOrderNum(newOrderNum);
    setOrderPlaced(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 py-12 container mx-auto px-4 lg:px-8 max-w-5xl">
        {orderPlaced ? (
          /* Order Confirmation Screen */
          <div className="bg-surface-lowest rounded-3xl p-8 sm:p-12 border border-outline-variant text-center space-y-6 shadow-elevated">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono text-gold font-bold uppercase tracking-widest block">Order Placed Successfully</span>
              <h1 className="font-serif text-3xl font-bold">Thank You, {recipient}!</h1>
              <p className="text-sm text-outline">Order Number: <strong className="text-on-surface font-mono">{placedOrderNum}</strong></p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-low border border-outline-variant/60 max-w-md mx-auto text-left text-xs space-y-3">
              <div className="flex items-center text-gold font-bold text-sm">
                <Phone className="w-4 h-4 mr-2" /> What Happens Next?
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                Our sales team will call your phone (<strong className="text-on-surface font-mono">{phone}</strong>) within 30 minutes to confirm your shipping address and COD order.
              </p>
              <div className="pt-2 border-t border-outline-variant flex items-center space-x-2 text-green-700 font-semibold">
                <PackageCheck className="w-4 h-4" />
                <span>Open-Box Inspection Enabled for Rider</span>
              </div>
            </div>

            <div className="pt-4 flex justify-center space-x-4">
              <Link href={`/order/${placedOrderNum}?phone=${encodeURIComponent(phone)}`} className="px-6 py-3 rounded-xl bg-gold text-on-surface font-bold text-xs shadow-gold hover:bg-gold-hover transition-colors">
                Track Order Online
              </Link>
              <Link href="/" className="px-6 py-3 rounded-xl bg-surface-container text-on-surface font-semibold text-xs border border-outline-variant">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          /* Single Page Checkout Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Column */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-tight">Express Checkout</h1>
                <p className="text-xs text-outline mt-1">Single page fast checkout with Open-Box Cash on Delivery</p>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* Contact Information */}
                <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant space-y-4">
                  <h3 className="font-serif font-bold text-base flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gold" /> Primary Customer Identity
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-outline mb-1">Phone Number (Required for COD Call)</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9801234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-outline mb-1">Recipient Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant space-y-4">
                  <h3 className="font-serif font-bold text-base flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gold" /> Delivery Address
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-outline mb-1">District</label>
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold font-semibold"
                      >
                        {NEPAL_DISTRICTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-outline mb-1">City / Area</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. New Road / Thamel / Chabahil"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-outline mb-1">Landmark (Nepali addresses depend on landmarks)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Bhatbhateni Supermarket / Opposite Temple"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-sm focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant space-y-4">
                  <h3 className="font-serif font-bold text-base flex items-center">
                    <CreditCard className="w-4 h-4 mr-2 text-gold" /> Payment Method
                  </h3>
                  
                  <div className="space-y-3">
                    <label className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "cod" ? "border-gold bg-gold/10" : "border-outline-variant bg-surface-low"}`}>
                      <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="mt-1 accent-gold"
                      />
                      <div className="ml-3">
                        <span className="font-bold text-sm text-on-surface block">Cash on Delivery (COD) — Default</span>
                        <span className="text-xs text-outline block mt-0.5">Pay cash after opening and inspecting the product box.</span>
                      </div>
                    </label>

                    <label className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "esewa" ? "border-gold bg-gold/10" : "border-outline-variant bg-surface-low"}`}>
                      <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === "esewa"}
                        onChange={() => setPaymentMethod("esewa")}
                        className="mt-1 accent-gold"
                      />
                      <div className="ml-3">
                        <span className="font-bold text-sm text-green-700 block">eSewa Mobile Wallet</span>
                        <span className="text-xs text-outline block mt-0.5">Instant online payment via eSewa app.</span>
                      </div>
                    </label>

                    <label className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "khalti" ? "border-gold bg-gold/10" : "border-outline-variant bg-surface-low"}`}>
                      <input
                        type="radio"
                        name="pm"
                        checked={paymentMethod === "khalti"}
                        onChange={() => setPaymentMethod("khalti")}
                        className="mt-1 accent-gold"
                      />
                      <div className="ml-3">
                        <span className="font-bold text-sm text-purple-700 block">Khalti Wallet</span>
                        <span className="text-xs text-outline block mt-0.5">Pay via Khalti web or mobile app.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-base shadow-gold transition-colors"
                >
                  Confirm Order ({formatNpr(totalNpr)})
                </button>
              </form>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant space-y-4 shadow-soft">
                <h3 className="font-serif font-bold text-base border-b border-outline-variant pb-3">Order Summary</h3>
                
                <div className="flex items-center space-x-3 text-xs py-2">
                  <div className="w-12 h-12 rounded-lg bg-surface-low overflow-hidden flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=200&q=80" alt="Item" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-serif font-bold">Ikonic Pro Hair Straightener</h5>
                    <span className="text-outline">Qty: 1</span>
                  </div>
                  <span className="font-bold font-mono">{formatNpr(itemSubtotalNpr)}</span>
                </div>

                <div className="pt-3 border-t border-outline-variant space-y-2 text-xs text-outline">
                  <div className="flex justify-between">
                    <span>Item Subtotal</span>
                    <span className="font-mono text-on-surface">{formatNpr(itemSubtotalNpr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge ({isValley ? "Kathmandu Valley" : "Outside Valley"})</span>
                    <span className="font-mono text-on-surface">{formatNpr(deliveryNpr)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-on-surface pt-2 border-t border-outline-variant">
                    <span>Total Amount</span>
                    <span className="font-mono text-gold text-base">{formatNpr(totalNpr)}</span>
                  </div>
                </div>
              </div>

              {/* Open-the-box COD Guarantee Box */}
              <div className="p-5 rounded-2xl bg-gold/15 border-2 border-gold/40 text-xs space-y-2">
                <div className="flex items-center text-gold font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 mr-2" /> Open The Box Before You Pay
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Our delivery rider will let you open and inspect your Ikonic package before paying cash. If the seal or product is damaged, reject it on the spot with zero penalty!
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
