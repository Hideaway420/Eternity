"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { CartDrawer } from "@/components/storefront/CartDrawer";

export const MobileBottomBar: React.FC = () => {
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // The cart is a drawer, not a route — there is no /cart page. Opening it here instead
  // of navigating to /checkout lets mobile users review the cart before checking out.
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartItems = useCartStore((state) => state.cartItems);
  const derivedTotalItems = isMounted
    ? cartItems.reduce((total, item) => total + item.qty, 0)
    : 0;

  return (
    <>
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F8F3EC]/95 backdrop-blur-xl border-t border-[#E8E1D7] py-2 px-6 shadow-elevated">
      <div className="flex justify-around items-center text-center">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center space-y-1 transition-colors ${
            pathname === "/" ? "text-gold font-bold" : "text-outline hover:text-on-surface"
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>

        {/* Categories */}
        <Link
          href="/c/manicure-pedicure-spa-furniture"
          className={`flex flex-col items-center space-y-1 transition-colors ${
            pathname.startsWith("/c/") ? "text-gold font-bold" : "text-outline hover:text-on-surface"
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-medium">Categories</span>
        </Link>

        {/* Cart — opens the cart drawer for review instead of jumping straight to checkout */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className={`relative flex flex-col items-center space-y-1 transition-colors ${
            isCartOpen ? "text-gold font-bold" : "text-outline hover:text-on-surface"
          }`}
          aria-label="Open Shopping Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {derivedTotalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-black text-white text-[9px] font-bold min-w-[16px] h-4 px-0.5 rounded-full flex items-center justify-center font-mono shadow-sm">
                {derivedTotalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>
      </div>
    </div>

    {/*
      The drawer MUST sit outside the bar above. `backdrop-blur-xl` sets backdrop-filter, which
      makes that element a containing block for fixed-position descendants, so the drawer's
      `fixed inset-0` would resolve to the ~56px bar instead of the viewport and open as an
      unusable squashed strip.
    */}
    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};
