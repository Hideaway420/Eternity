"use client";

import React, { useState } from "react";
import { addProductAction, CategorySlugType } from "@/actions/addProduct";
import { Sparkles, Upload, CheckCircle2, ShieldCheck, ArrowLeft, Image as ImageIcon, Loader2, Glasses } from "lucide-react";
import Link from "next/link";

export default function InventoryStudioPage() {
  const [formData, setFormData] = useState({
    name: "",
    category_slug: "eyewear" as CategorySlugType,
    price_npr: "",
    deposit_percentage: "15",
    description: "",
    image_url: "",
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Task 3: Direct File Upload to /api/admin/upload-image API route
  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFeedback(null);

    try {
      const data = new FormData();
      data.append("image", file);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: data,
      });

      const json = await res.json();

      if (json.success && json.url) {
        setFormData((prev) => ({ ...prev, image_url: json.url }));
        setFeedback({ type: "success", message: "Image uploaded successfully to server!" });
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to upload image file." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Failed to upload image file." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await addProductAction({
        name: formData.name,
        category_slug: formData.category_slug,
        price_npr: Number(formData.price_npr || 0),
        deposit_percentage: Number(formData.deposit_percentage || 15),
        description: formData.description,
        image_url: formData.image_url,
      });

      if (res.success) {
        setFeedback({ type: "success", message: res.message || "Product injected into Turso successfully!" });
        // Reset form
        setFormData({
          name: "",
          category_slug: formData.category_slug,
          price_npr: "",
          deposit_percentage: "15",
          description: "",
          image_url: "",
        });
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to inject product." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "An unexpected error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1B1C1C] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-[#E8E1D7] pb-5">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#B58A18] font-bold block flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Internal Ghost Portal • Eternity Nepal
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1B1C1C] mt-1">
              5-Category Inventory Studio
            </h1>
          </div>
          <Link
            href="/"
            className="px-3.5 py-2 bg-[#F8F3EC] border border-[#E0D8CD] hover:border-[#B58A18] text-xs font-bold rounded-xl text-[#2C2A29] transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Storefront</span>
          </Link>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl mb-6 text-xs sm:text-sm font-bold flex items-center space-x-2 border shadow-xs ${
              feedback.type === "success"
                ? "bg-[#EBF7EE] text-[#1B5E20] border-[#A5D6A7]"
                : "bg-[#FDF2F2] text-[#B71C1C] border-[#EF9A9A]"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-[#F8F3EC] border border-[#E8E1D7] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524F4A] mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ray-Ban Tech Carbon Fiber Polarized / Oakley Radar EV Path Prizm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#E0D8CD] rounded-xl px-4 py-3 text-sm font-bold text-[#1B1C1C] focus:outline-none focus:border-[#B58A18] placeholder-[#7A7570]"
            />
          </div>

          {/* Category & Deposit % (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#524F4A] mb-2">
                Category Silo *
              </label>
              <select
                value={formData.category_slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_slug: e.target.value as CategorySlugType,
                  })
                }
                className="w-full bg-[#FDFBF7] border border-[#E0D8CD] rounded-xl px-4 py-3 text-sm font-bold text-[#1B1C1C] focus:outline-none focus:border-[#B58A18]"
              >
                <option value="eyewear">👓 Premium Eyewear (Oakley, Ray-Ban Tech)</option>
                <option value="manicure-pedicure-spa-furniture">🛁 Manicure & Pedicure Spa Furniture</option>
                <option value="luxury-chairs">🪑 Luxury Chairs</option>
                <option value="hair-straighteners">✨ Hair Straighteners</option>
                <option value="hair-dryers-curlers">💨 Hair Dryers & Curlers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#524F4A] mb-2">
                Upfront Deposit (%) *
              </label>
              <input
                type="number"
                required
                min="0"
                max="100"
                placeholder="15"
                value={formData.deposit_percentage}
                onChange={(e) => setFormData({ ...formData, deposit_percentage: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-[#E0D8CD] rounded-xl px-4 py-3 text-sm font-bold text-[#1B1C1C] focus:outline-none focus:border-[#B58A18]"
              />
            </div>
          </div>

          {/* Price (NPR) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524F4A] mb-2">
              Price (NPR) — (Enter 0 for "Coming Soon" Placeholders)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 18500 (or 0 for Coming Soon)"
              value={formData.price_npr}
              onChange={(e) => setFormData({ ...formData, price_npr: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#E0D8CD] rounded-xl px-4 py-3 text-sm font-bold text-[#1B1C1C] focus:outline-none focus:border-[#B58A18]"
            />
            <span className="text-[11px] text-[#7A7570] mt-1 block">
              Enter 0 to mark item as "Coming Soon". Non-zero prices convert to integer paisa (NPR × 100).
            </span>
          </div>

          {/* SEO Meta Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524F4A] mb-2">
              SEO Description (Dynamic Metadata Engine)
            </label>
            <textarea
              rows={3}
              placeholder="High-converting description for Nepalese Google crawlers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#E0D8CD] rounded-xl px-4 py-3 text-sm font-normal text-[#1B1C1C] focus:outline-none focus:border-[#B58A18] placeholder-[#7A7570]"
            />
          </div>

          {/* Direct Image Upload Input (Task 3) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#524F4A] mb-2">
              Product Image (Direct File Upload from Device)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="flex items-center justify-center space-x-2 px-5 py-3.5 bg-[#B58A18] hover:bg-[#A37B15] text-[#1B1C1C] rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-md flex-shrink-0">
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-[#1B1C1C]" /> : <Upload className="w-4 h-4 text-[#1B1C1C]" />}
                <span>Direct Upload File</span>
                <input type="file" accept="image/*" onChange={handleDirectImageUpload} className="hidden" />
              </label>

              <input
                type="text"
                placeholder="Or paste asset URL / path..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full bg-[#FDFBF7] border border-[#E0D8CD] rounded-xl px-4 py-3 text-xs font-bold text-[#1B1C1C] focus:outline-none focus:border-[#B58A18]"
              />
            </div>

            {/* Image Preview */}
            {formData.image_url && (
              <div className="mt-3 flex items-center space-x-3 p-2.5 bg-[#FDFBF7] border border-[#E0D8CD] rounded-xl">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#E0D8CD] flex-shrink-0 bg-[#F5F0E8]">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-[#1B1C1C] block">
                    Upload Ready
                  </span>
                  <span className="text-[10px] font-mono text-[#7A7570] truncate block">
                    {formData.image_url}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || uploadingImage}
            className="w-full py-4 bg-[#B58A18] hover:bg-[#A37B15] disabled:opacity-50 text-[#1B1C1C] font-bold rounded-2xl text-sm transition-all shadow-md flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#1B1C1C]" />
                <span>Injecting into Turso Database...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#1B1C1C]" />
                <span>Inject Product into Turso</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
