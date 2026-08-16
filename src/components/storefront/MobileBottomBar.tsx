"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingBag, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export const MobileBottomBar: React.FC = () => {
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cartItems = useCartStore((state) => state.cartItems);
  const derivedTotalItems = isMounted
    ? cartItems.reduce((total, item) => total + item.qty, 0)
    : 0;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F8F3EC]/95 backdrop-blur-xl border-t border-[#E8E1D7] py-2 px-4 shadow-elevated">
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
          href="/c/hair-straighteners"
          className={`flex flex-col items-center space-y-1 transition-colors ${
            pathname.startsWith("/c/") ? "text-gold font-bold" : "text-outline hover:text-on-surface"
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-medium">Categories</span>
        </Link>

        {/* Cart */}
        <Link
          href="/checkout"
          className={`relative flex flex-col items-center space-y-1 transition-colors ${
            pathname === "/checkout" ? "text-gold font-bold" : "text-outline hover:text-on-surface"
          }`}
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
        </Link>

        {/* Account / Admin */}
        <Link
          href="/admin/login"
          className={`flex flex-col items-center space-y-1 transition-colors ${
            pathname.startsWith("/admin") ? "text-gold font-bold" : "text-outline hover:text-on-surface"
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">Account</span>
        </Link>
      </div>
    </div>
  );
};
