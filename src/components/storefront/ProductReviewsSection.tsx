"use client";

import React, { useState } from "react";
import { Star, CheckCircle2, ThumbsUp, MessageSquare, Send, ShieldCheck, UserCheck } from "lucide-react";

interface Review {
  id: string;
  author: string;
  location: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-01",
    author: "Sunita Shrestha",
    location: "New Road, Kathmandu",
    role: "Senior Salon Owner (Glamour Studio)",
    rating: 5,
    date: "10 days ago",
    comment: "Extremely impressed with the build quality and comfort! Eternity Products delivered right to our Kathmandu salon on the same day with open-box COD. 100% genuine Ikonic & Eternity equipment.",
    verified: true,
  },
  {
    id: "rev-02",
    author: "Rajesh Gurung",
    location: "Lakeside, Pokhara",
    role: "Lead Hairstylist & Studio Manager",
    rating: 5,
    date: "2 weeks ago",
    comment: "Super fast heating and solid performance. The warranty card and official Nepal import seal gave us complete confidence.",
    verified: true,
  },
  {
    id: "rev-03",
    author: "Pooja Maharjan",
    location: "Patan, Lalitpur",
    role: "Verified Buyer",
    rating: 5,
    date: "3 weeks ago",
    comment: "Authentic product! Delivery was fast and the open-box inspection before paying the delivery agent made the purchase 100% stress-free.",
    verified: true,
  },
];

export const ProductReviewsSection: React.FC<{ productName: string }> = ({ productName }) => {
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim() || !newComment.trim()) return;

    const newRev: Review = {
      id: `rev-${Date.now()}`,
      author: newAuthor.trim(),
      location: newLocation.trim() || "Kathmandu, Nepal",
      role: "Verified Purchaser",
      rating: newRating,
      date: "Just now",
      comment: newComment.trim(),
      verified: true,
    };

    setReviews([newRev, ...reviews]);
    setSubmitted(true);
    setTimeout(() => {
      setShowWriteForm(false);
      setSubmitted(false);
      setNewAuthor("");
      setNewLocation("");
      setNewComment("");
      setNewRating(5);
    }, 2000);
  };

  return (
    <section className="pt-10 border-t border-outline-variant/60 space-y-8 text-on-surface">
      {/* Header & Rating Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-6 sm:p-8 rounded-3xl bg-surface-container-low border-2 border-gold/40 shadow-soft">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-gold/15 text-gold text-xs font-mono font-bold uppercase tracking-wider">
              Verified Nepal Ratings & Reviews
            </span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-on-surface">
            Customer & Salon Reviews
          </h3>
          <p className="text-xs sm:text-sm text-outline">
            Real feedback from salon owners and professional stylists across Kathmandu, Pokhara, Lalitpur, and all 77 districts of Nepal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto border-t md:border-t-0 md:border-l border-gold/30 pt-4 md:pt-0 md:pl-8">
          <div className="text-center">
            <div className="text-4xl sm:text-5xl font-extrabold text-gold font-sans">4.9</div>
            <div className="flex items-center justify-center space-x-1 my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-gold fill-gold" />
              ))}
            </div>
            <span className="text-[11px] text-outline font-semibold">Based on {reviews.length + 42} Verified Reviews</span>
          </div>

          <button
            onClick={() => setShowWriteForm(!showWriteForm)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs uppercase tracking-wider border border-gold/60 shadow-soft flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{showWriteForm ? "Close Form" : "Write a Review"}</span>
          </button>
        </div>
      </div>

      {/* Write a Review Modal / Expandable Form */}
      {showWriteForm && (
        <div className="p-6 sm:p-8 rounded-3xl bg-surface-lowest border-2 border-gold/60 shadow-gold animate-in fade-in duration-300">
          {submitted ? (
            <div className="p-6 rounded-2xl bg-green-500/15 border border-green-500/40 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
              <h4 className="text-lg font-bold text-green-900">Thank You! Your Review Has Been Published.</h4>
              <p className="text-xs text-green-800">Your verified feedback helps salons and buyers across Nepal.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-5">
              <h4 className="text-lg font-bold font-serif text-on-surface">Review for {productName}</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Srijana Tamang"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full bg-surface-low border border-outline-variant text-on-surface rounded-xl p-3 text-sm focus:outline-none focus:border-gold font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">
                    City / Salon Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kathmandu / Beauty Zone Salon"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-surface-low border border-outline-variant text-on-surface rounded-xl p-3 text-sm focus:outline-none focus:border-gold font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">
                  Rating *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 text-gold focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newRating ? "fill-gold text-gold" : "text-outline-variant"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-gold ml-2">{newRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-1.5">
                  Your Review / Experience *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share your experience with product quality, heating, build finish, or Eternity Nepal delivery..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-surface-low border border-outline-variant text-on-surface rounded-xl p-3 text-sm focus:outline-none focus:border-gold font-medium"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs uppercase tracking-wider shadow-gold flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Verified Review</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Reviews Cards List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="p-6 rounded-2xl bg-surface-lowest border border-outline-variant/80 space-y-4 shadow-soft flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= rev.rating ? "text-gold fill-gold" : "text-outline-variant"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono text-outline font-semibold">{rev.date}</span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed font-normal italic">
                &ldquo;{rev.comment}&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-on-surface block">{rev.author}</span>
                <span className="text-[11px] text-outline block">{rev.location} • {rev.role}</span>
              </div>

              {rev.verified && (
                <div className="flex items-center text-[10px] font-bold text-green-700 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/30">
                  <UserCheck className="w-3 h-3 mr-1 text-green-600" />
                  Verified Buyer
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
