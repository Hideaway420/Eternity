import React from "react";
import { Star } from "lucide-react";

// ponytail: no reviews table exists in the schema yet. There is nothing real to show, and no
// backend to persist a submitted review, so this renders an honest empty state instead of
// fabricated ratings/reviews and a form that would silently discard input. Add the write-a-review
// form back once a `reviews` table + submit API exist.
export const ProductReviewsSection: React.FC<{ productName: string }> = ({ productName }) => {
  return (
    <section className="pt-10 border-t border-outline-variant/60 text-on-surface">
      <div className="p-6 sm:p-8 rounded-3xl bg-surface-container-low border-2 border-gold/40 shadow-soft text-center space-y-2">
        <Star className="w-6 h-6 text-outline-variant mx-auto" />
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-on-surface">Customer & Salon Reviews</h3>
        <p className="text-xs sm:text-sm text-outline max-w-md mx-auto">
          No reviews yet for {productName}. Message us on WhatsApp after your order to share your experience.
        </p>
      </div>
    </section>
  );
};
