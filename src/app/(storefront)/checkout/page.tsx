"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { ShieldCheck, CreditCard, Phone, MapPin, PackageCheck, Lock, Footprints } from "lucide-react";
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
  const [isSpaOrder, setIsSpaOrder] = useState<boolean>(true); // Toggle to simulate Spa Chair Order vs Normal Order
  const [paymentMethod, setPaymentMethod] = useState<"esewa" | "khalti" | "bank" | "cod">("esewa");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderNum, setPlacedOrderNum] = useState("");

  const isValley = district === "Kathmandu" || district === "Lalitpur" || district === "Bhaktapur";
  const deliveryNpr = isValley ? 0 : 50000; // Free delivery in Kathmandu Valley for Spa Equipment

  // Sample Spa Chair price: NPR 120,000 (Paisa: 12000000)
  const itemSubtotalNpr = isSpaOrder ? 12000000 : 1292000;
  const totalNpr = itemSubtotalNpr + deliveryNpr;

  // 15% Upfront Deposit calculation for Spa Chairs
  const upfrontDepositNpr = Math.round(totalNpr * 0.15);
  const remainingBalanceNpr = totalNpr - upfrontDepositNpr;

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
              <span className="text-xs font-mono text-gold font-bold uppercase tracking-widest block">
                {isSpaOrder ? "Spa Chair Deposit Booking Received" : "Order Placed Successfully"}
              </span>
              <h1 className="font-serif text-3xl font-bold">Thank You, {recipient}!</h1>
              <p className="text-sm text-outline">Order Number: <strong className="text-on-surface font-mono">{placedOrderNum}</strong></p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-low border border-outline-variant/60 max-w-md mx-auto text-left text-xs space-y-3">
              <div className="flex items-center text-gold font-bold text-sm">
                <Phone className="w-4 h-4 mr-2" /> {isSpaOrder ? "Upfront Booking Verification" : "What Happens Next?"}
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                {isSpaOrder
                  ? `Our concierge manager will call your phone (${phone}) to verify your 15% upfront booking deposit of ${formatNpr(upfrontDepositNpr)} and schedule custom color matching & floor delivery.`
                  : `Our sales team will call your phone (${phone}) within 30 minutes to confirm your shipping address and COD order.`}
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
                <h1 className="font-serif text-3xl font-bold tracking-tight">Eternity Express Checkout</h1>
                <p className="text-xs text-outline mt-1">
                  {isSpaOrder
                    ? "Luxury Spa Chairs require a 10% - 15% upfront booking deposit. Remaining balance on delivery."
                    : "Other product categories set strictly to 100% Open-Box Cash on Delivery (COD)."}
                </p>
              </div>

              {/* Toggle to Simulate Spa Product vs Hair Tools */}
              <div className="p-4 rounded-2xl bg-surface-low border border-gold/40 flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface flex items-center">
                  <Footprints className="w-4 h-4 mr-1.5 text-gold" /> Simulating Cart Product Type:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextSpa = !isSpaOrder;
                    setIsSpaOrder(nextSpa);
                    setPaymentMethod(nextSpa ? "esewa" : "cod");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gold/15 border border-gold/40 text-gold text-xs font-bold hover:bg-gold/30 transition-colors"
                >
                  {isSpaOrder ? "Luxury Spa Product (15% Deposit)" : "Standard Category (100% COD)"}
                </button>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* Contact Information */}
                <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant space-y-4">
                  <h3 className="font-serif font-bold text-base flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gold" /> Primary Customer Identity
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-outline mb-1">Phone Number (Required for Call & Booking)</label>
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
                    <label className="block text-xs font-semibold text-outline mb-1">Recipient / Salon Owner Name</label>
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

                {/* Payment Method Rules */}
                <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant space-y-4">
                  <h3 className="font-serif font-bold text-base flex items-center justify-between">
                    <span className="flex items-center"><CreditCard className="w-4 h-4 mr-2 text-gold" /> Payment Rules</span>
                    {isSpaOrder && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                        15% Deposit Required
                      </span>
                    )}
                  </h3>
                  
                  {isSpaOrder ? (
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl bg-gold/15 border border-gold/40 text-xs font-bold text-on-surface">
                        🔒 Luxury Spa Product Rule: A 10% - 15% upfront booking deposit ({formatNpr(upfrontDepositNpr)}) is required via eSewa, Khalti, or Bank Transfer to confirm manufacturing & floor delivery.
                      </div>

                      <label className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "esewa" ? "border-gold bg-gold/10" : "border-outline-variant bg-surface-low"}`}>
                        <input
                          type="radio"
                          name="pm"
                          checked={paymentMethod === "esewa"}
                          onChange={() => setPaymentMethod("esewa")}
                          className="mt-1 accent-gold"
                        />
                        <div className="ml-3">
                          <span className="font-bold text-sm text-green-700 block">eSewa Mobile Wallet (15% Deposit)</span>
                          <span className="text-xs text-outline block mt-0.5">Pay upfront deposit {formatNpr(upfrontDepositNpr)} via eSewa app.</span>
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
                          <span className="font-bold text-sm text-purple-700 block">Khalti Wallet (15% Deposit)</span>
                          <span className="text-xs text-outline block mt-0.5">Pay upfront deposit {formatNpr(upfrontDepositNpr)} via Khalti app.</span>
                        </div>
                      </label>

                      <label className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${paymentMethod === "bank" ? "border-gold bg-gold/10" : "border-outline-variant bg-surface-low"}`}>
                        <input
                          type="radio"
                          name="pm"
                          checked={paymentMethod === "bank"}
                          onChange={() => setPaymentMethod("bank")}
                          className="mt-1 accent-gold"
                        />
                        <div className="ml-3">
                          <span className="font-bold text-sm text-blue-700 block">Direct Nepal Bank Transfer (15% Deposit)</span>
                          <span className="text-xs text-outline block mt-0.5">Pay deposit to Eternity Products Nabil Bank A/C.</span>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="flex items-start p-4 rounded-xl border border-gold bg-gold/10 cursor-pointer">
                        <input
                          type="radio"
                          name="pm"
                          checked={true}
                          readOnly
                          className="mt-1 accent-gold"
                        />
                        <div className="ml-3">
                          <span className="font-bold text-sm text-on-surface block">Strict Cash on Delivery (COD)</span>
                          <span className="text-xs text-outline block mt-0.5">Pay 100% cash after opening and inspecting the product box upon delivery.</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-base shadow-gold transition-colors"
                >
                  {isSpaOrder
                    ? `Pay 15% Upfront Deposit (${formatNpr(upfrontDepositNpr)}) & Reserve Chair`
                    : `Confirm Cash on Delivery Order (${formatNpr(totalNpr)})`}
                </button>
              </form>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant space-y-4 shadow-soft">
                <h3 className="font-serif font-bold text-base border-b border-outline-variant pb-3">Order Summary</h3>
                
                <div className="flex items-center space-x-3 text-xs py-2">
                  <div className="w-14 h-14 rounded-lg bg-surface-low overflow-hidden flex-shrink-0">
                    <img
                      src={isSpaOrder ? "/products/spa_chair_classic.jpg" : "https://www.ikonicworld.com/cdn/shop/files/8904231015937_1_702816a3-41c8-4c88-92b3-ab4c7779920f.jpg"}
                      alt="Item"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-serif font-bold">
                      {isSpaOrder ? "Classic Eternity Spa Chair" : "Ikonic Pro Hair Straightener"}
                    </h5>
                    <span className="text-outline">Qty: 1 • Custom Color Match</span>
                  </div>
                  <span className="font-bold font-mono">{formatNpr(itemSubtotalNpr)}</span>
                </div>

                <div className="pt-3 border-t border-outline-variant space-y-2 text-xs text-outline">
                  <div className="flex justify-between">
                    <span>Item Subtotal</span>
                    <span className="font-mono text-on-surface">{formatNpr(itemSubtotalNpr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-mono text-on-surface">{deliveryNpr === 0 ? "FREE" : formatNpr(deliveryNpr)}</span>
                  </div>

                  {isSpaOrder ? (
                    <>
                      <div className="flex justify-between font-bold text-gold pt-2 border-t border-outline-variant">
                        <span>15% Upfront Booking Deposit</span>
                        <span className="font-mono text-base">{formatNpr(upfrontDepositNpr)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-outline">
                        <span>Balance Payable Upon Delivery</span>
                        <span className="font-mono">{formatNpr(remainingBalanceNpr)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between font-bold text-sm text-on-surface pt-2 border-t border-outline-variant">
                      <span>Total Amount (COD)</span>
                      <span className="font-mono text-gold text-base">{formatNpr(totalNpr)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Open-the-box COD Guarantee Box */}
              <div className="p-5 rounded-2xl bg-gold/15 border-2 border-gold/40 text-xs space-y-2">
                <div className="flex items-center text-gold font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 mr-2" /> Authenticity & Open-Box Promise
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  Our delivery rider will let you open and inspect your Eternity package before paying the remaining balance. Serial hologram verification card included!
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
