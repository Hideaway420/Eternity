"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import {
  ShieldCheck,
  CreditCard,
  Phone,
  MapPin,
  PackageCheck,
  ShoppingBag,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { formatNpr } from "@/lib/money";
import { useCartStore, type CartItem } from "@/store/useCartStore";
import { isValidNepalPhone } from "@/lib/phone";
import { track } from "@/lib/analytics";

const NEPAL_DISTRICTS = [
  "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara (Kaski)", "Chitwan", "Rupandehi (Butwal)",
  "Morang (Biratnagar)", "Sunsari (Dharan)", "Jhapa", "Kaski", "Parsa (Birgunj)",
  "Kavrepalanchok", "Nuwakot", "Makwanpur (Hetauda)", "Banke (Nepalgunj)", "Other District"
];

const INSIDE_VALLEY = new Set(["Kathmandu", "Lalitpur", "Bhaktapur"]);
const OUTSIDE_VALLEY_DELIVERY_NPR = 50000; // NPR 500 in paisa - must match src/app/api/orders/route.ts
const WHATSAPP_NUMBER = "9779868089892";

interface PlacedOrderItem {
  name: string;
  sku: string;
  qty: number;
  unitPriceNpr: number;
  lineTotalNpr: number;
}

interface PlacedOrder {
  orderNumber: string;
  isSpaOrder: boolean;
  items: PlacedOrderItem[];
  subtotalNpr: number;
  deliveryNpr: number;
  totalNpr: number;
}

// ponytail: the cart only carries sku/name/color, not category. This heuristic just decides which
// payment copy to preview before submit; the API recomputes isSpaOrder from the real product.line
// field and that server value is what actually gets stored and shown on the confirmation screen.
function isSpaCartItem(item: CartItem): boolean {
  const haystack = `${item.sku} ${item.name}`.toLowerCase();
  // "chair" is deliberately absent: it matched luxury salon chairs, which are COD, not deposit.
  return ["spa", "pedicure", "manicure", "recliner", "station"].some((k) => haystack.includes(k));
}

export default function CheckoutPage() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const cartItems = useCartStore((state) => state.cartItems);
  const clearCart = useCartStore((state) => state.clearCart);

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [recipient, setRecipient] = useState("");
  const [district, setDistrict] = useState("Kathmandu");
  const [city, setCity] = useState("");
  const [landmark, setLandmark] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"esewa" | "khalti" | "bank" | "cod">("cod");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  const isSpaOrder = useMemo(() => cartItems.some(isSpaCartItem), [cartItems]);

  // Payment options differ between spa/furniture (deposit) and standard (COD-only) carts; keep the
  // selection sane whenever the cart composition flips between the two.
  useEffect(() => {
    setPaymentMethod(isSpaOrder ? "esewa" : "cod");
  }, [isSpaOrder]);

  // Fires once per checkout visit with a non-empty cart. Ad platforms want NPR, not paisa.
  const beginCheckoutFired = React.useRef(false);
  useEffect(() => {
    if (beginCheckoutFired.current || cartItems.length === 0) return;
    beginCheckoutFired.current = true;
    track("begin_checkout", {
      value: Math.round(cartItems.reduce((sum, i) => sum + i.price_npr * i.qty, 0) / 100),
      items: cartItems.map((i) => ({
        id: i.sku,
        name: i.name,
        price: Math.round(i.price_npr / 100),
        quantity: i.qty,
      })),
    });
  }, [cartItems]);

  const isValley = INSIDE_VALLEY.has(district);
  const previewSubtotalNpr = cartItems.reduce((sum, item) => sum + item.price_npr * item.qty, 0);
  const previewDeliveryNpr = isValley ? 0 : OUTSIDE_VALLEY_DELIVERY_NPR;
  const previewTotalNpr = previewSubtotalNpr + previewDeliveryNpr;
  const previewDepositNpr = Math.round(previewTotalNpr * 0.15);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidNepalPhone(phone)) {
      setPhoneError("Enter a valid Nepal phone number (e.g. 98XXXXXXXX).");
      return;
    }
    setPhoneError("");
    setSubmitError("");

    if (cartItems.length === 0 || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          recipient,
          district,
          city,
          landmark,
          paymentMethod,
          items: cartItems.map((item) => ({
            sku: item.sku,
            qty: item.qty,
            customColorMatch: item.customColorMatch,
          })),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setSubmitError(data?.error || "Could not place your order. Please try again.");
        return;
      }

      const order = data.order as PlacedOrder;
      track("purchase", {
        transaction_id: order.orderNumber,
        value: Math.round(order.totalNpr / 100),
        items: order.items.map((i) => ({
          id: i.sku,
          name: i.name,
          price: Math.round(i.unitPriceNpr / 100),
          quantity: i.qty,
        })),
      });

      setPlacedOrder(order);
      clearCart();
    } catch {
      setSubmitError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappUrl = placedOrder
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Hi Eternity Products! I just placed order ${placedOrder.orderNumber}:\n` +
          placedOrder.items.map((i) => `- ${i.qty}x ${i.name} (${i.sku})`).join("\n") +
          `\nTotal: ${formatNpr(placedOrder.totalNpr)}\nPlease confirm my order. Thank you!`
      )}`
    : "";

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 py-12 container mx-auto px-4 lg:px-8 max-w-5xl">
        {!isMounted ? (
          <div className="py-24 text-center text-xs text-outline">Loading your cart...</div>
        ) : placedOrder ? (
          /* Order Confirmation Screen */
          <div className="bg-surface-lowest rounded-3xl p-8 sm:p-12 border border-outline-variant text-center space-y-6 shadow-elevated">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono text-gold font-bold uppercase tracking-widest block">
                {placedOrder.isSpaOrder ? "Spa Chair Deposit Booking Received" : "Order Placed Successfully"}
              </span>
              <h1 className="font-serif text-3xl font-bold">Thank You, {recipient}!</h1>
              <p className="text-sm text-outline">
                Order Number: <strong className="text-on-surface font-mono">{placedOrder.orderNumber}</strong>
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface-low border border-outline-variant/60 max-w-md mx-auto text-left text-xs space-y-3">
              <div className="flex items-center text-gold font-bold text-sm">
                <Phone className="w-4 h-4 mr-2" /> {placedOrder.isSpaOrder ? "Upfront Booking Verification" : "What Happens Next?"}
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                {placedOrder.isSpaOrder
                  ? `Our concierge manager will call your phone (${phone}) to verify your 15% upfront booking deposit of ${formatNpr(
                      Math.round(placedOrder.totalNpr * 0.15)
                    )} and schedule custom color matching & floor delivery.`
                  : `Our sales team will call your phone (${phone}) within 30 minutes to confirm your shipping address and Cash on Delivery order.`}
              </p>
              <div className="pt-2 border-t border-outline-variant flex items-center space-x-2 text-green-700 font-semibold">
                <PackageCheck className="w-4 h-4" />
                <span>Open-Box Inspection Enabled for Rider</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-surface-low border border-outline-variant/60 max-w-md mx-auto text-left text-xs space-y-2">
              {placedOrder.items.map((item) => (
                <div key={item.sku} className="flex justify-between">
                  <span className="text-outline">
                    {item.qty}x {item.name}
                  </span>
                  <span className="font-mono text-on-surface">{formatNpr(item.lineTotalNpr)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-outline-variant font-bold">
                <span>Total</span>
                <span className="font-mono text-gold">{formatNpr(placedOrder.totalNpr)}</span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full max-w-md mx-auto py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-sm shadow-sm transition-colors flex justify-center items-center space-x-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Notify Us on WhatsApp Now (+977 9868089892)</span>
            </a>

            <div className="pt-2 flex justify-center space-x-4">
              <Link
                href={`/order/${placedOrder.orderNumber}?phone=${encodeURIComponent(phone)}`}
                className="px-6 py-3 rounded-xl bg-gold text-on-surface font-bold text-xs shadow-gold hover:bg-gold-hover transition-colors"
              >
                Track Order Online
              </Link>
              <Link href="/" className="px-6 py-3 rounded-xl bg-surface-container text-on-surface font-semibold text-xs border border-outline-variant">
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* Real Empty Cart State */
          <div className="bg-surface-lowest rounded-3xl p-8 sm:p-12 border border-outline-variant text-center space-y-4 shadow-elevated">
            <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center mx-auto border border-outline-variant">
              <ShoppingBag className="w-8 h-8 text-outline/50" />
            </div>
            <h1 className="font-serif text-2xl font-bold">Your cart is empty</h1>
            <p className="text-sm text-outline">Add a product to your cart before checking out.</p>
            <Link
              href="/c/hair-straighteners"
              className="inline-block px-6 py-3 bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs rounded-xl shadow-gold transition-colors"
            >
              Explore Hair Tools
            </Link>
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
                    : "Other product categories set strictly to 100% Open-Box Cash on Delivery."}
                </p>
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
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError("");
                      }}
                      className={`w-full bg-surface-low border rounded-xl p-3 text-sm focus:outline-none font-mono ${
                        phoneError ? "border-red-500 focus:border-red-500" : "border-outline-variant focus:border-gold"
                      }`}
                    />
                    {phoneError && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center">
                        <AlertCircle className="w-3.5 h-3.5 mr-1" /> {phoneError}
                      </p>
                    )}
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
                        🔒 Luxury Spa Product Rule: A 10% - 15% upfront booking deposit ({formatNpr(previewDepositNpr)}) is required via eSewa, Khalti, or Bank Transfer to confirm manufacturing & floor delivery.
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
                          <span className="text-xs text-outline block mt-0.5">Pay upfront deposit {formatNpr(previewDepositNpr)} via eSewa app.</span>
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
                          <span className="text-xs text-outline block mt-0.5">Pay upfront deposit {formatNpr(previewDepositNpr)} via Khalti app.</span>
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
                          <span className="font-bold text-sm text-on-surface block">Strict Cash on Delivery</span>
                          <span className="text-xs text-outline block mt-0.5">Pay 100% cash after opening and inspecting the product box upon delivery.</span>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gold hover:bg-gold-hover disabled:opacity-60 disabled:cursor-not-allowed text-on-surface font-bold text-base shadow-gold transition-colors flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <span>
                      {isSpaOrder
                        ? `Pay 15% Upfront Deposit (${formatNpr(previewDepositNpr)}) & Reserve Chair`
                        : `Confirm Cash on Delivery Order (${formatNpr(previewTotalNpr)})`}
                    </span>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant space-y-4 shadow-soft">
                <h3 className="font-serif font-bold text-base border-b border-outline-variant pb-3">Order Summary</h3>

                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 text-xs py-2">
                      <div className="w-14 h-14 rounded-lg bg-surface-low overflow-hidden flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-serif font-bold line-clamp-1">{item.name}</h5>
                        <span className="text-outline">Qty: {item.qty}{item.color ? ` • ${item.color}` : ""}</span>
                      </div>
                      <span className="font-bold font-mono">{formatNpr(item.price_npr * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-outline-variant space-y-2 text-xs text-outline">
                  <div className="flex justify-between">
                    <span>Item Subtotal</span>
                    <span className="font-mono text-on-surface">{formatNpr(previewSubtotalNpr)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-mono text-on-surface">{previewDeliveryNpr === 0 ? "FREE" : formatNpr(previewDeliveryNpr)}</span>
                  </div>

                  {isSpaOrder ? (
                    <>
                      <div className="flex justify-between font-bold text-gold pt-2 border-t border-outline-variant">
                        <span>15% Upfront Booking Deposit</span>
                        <span className="font-mono text-base">{formatNpr(previewDepositNpr)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-outline">
                        <span>Balance Payable Upon Delivery</span>
                        <span className="font-mono">{formatNpr(previewTotalNpr - previewDepositNpr)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between font-bold text-sm text-on-surface pt-2 border-t border-outline-variant">
                      <span>Total Amount (Cash on Delivery)</span>
                      <span className="font-mono text-gold text-base">{formatNpr(previewTotalNpr)}</span>
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
