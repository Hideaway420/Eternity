"use client";

import React, { useState } from "react";
import { addProductAction, CategorySlugType } from "@/actions/addProduct";
import { Sparkles, Upload, CheckCircle2, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
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

  // Direct File Upload to /api/admin/upload-image API route
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
    <div className="min-h-screen bg-gray-100 text-gray-900 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-5 rounded-2xl border-2 border-gray-300">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-yellow-700 font-extrabold block flex items-center">
              <ShieldCheck className="w-4 h-4 mr-1 text-yellow-600" /> Internal Ghost Portal • Eternity Nepal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black mt-1">
              5-Category Inventory Studio
            </h1>
          </div>
          <Link
            href="/admin/products"
            className="px-4 py-2.5 bg-gray-200 border-2 border-gray-400 hover:bg-gray-300 text-xs font-extrabold rounded-xl text-black flex items-center space-x-1"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Catalog</span>
          </Link>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 border-2 ${
              feedback.type === "success"
                ? "bg-green-100 text-green-900 border-green-400"
                : "bg-red-100 text-red-900 border-red-400"
            }`}
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Form Container - HIGH CONTRAST & STATIC */}
        <form onSubmit={handleSubmit} className="bg-white border-2 border-gray-300 rounded-2xl p-6 sm:p-8 space-y-6 text-gray-900">
          {/* Product Name */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ray-Ban Tech Carbon Fiber Polarized / Oakley Radar EV Path Prizm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border-2 border-gray-400 rounded-xl px-4 py-3 text-sm font-extrabold text-black focus:outline-none focus:border-black placeholder-gray-500"
            />
          </div>

          {/* Category & Deposit % (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-2">
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
                className="w-full bg-white border-2 border-gray-400 rounded-xl px-4 py-3 text-sm font-extrabold text-black focus:outline-none focus:border-black"
              >
                <option value="eyewear">👓 Premium Eyewear (Oakley, Ray-Ban Tech)</option>
                <option value="manicure-pedicure-spa-furniture">🛁 Manicure & Pedicure Spa Furniture</option>
                <option value="luxury-chairs">🪑 Luxury Chairs</option>
                <option value="hair-straighteners">✨ Hair Straighteners</option>
                <option value="hair-dryers-curlers">💨 Hair Dryers & Curlers</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-2">
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
                className="w-full bg-white border-2 border-gray-400 rounded-xl px-4 py-3 text-sm font-extrabold text-black focus:outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Price (NPR) */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-2">
              Price (NPR) — (Enter 0 for "Coming Soon" Placeholders)
            </label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 18500 (or 0 for Coming Soon)"
              value={formData.price_npr}
              onChange={(e) => setFormData({ ...formData, price_npr: e.target.value })}
              className="w-full bg-white border-2 border-gray-400 rounded-xl px-4 py-3 text-sm font-extrabold text-black focus:outline-none focus:border-black"
            />
            <span className="text-xs text-gray-700 font-bold mt-1 block">
              Enter 0 to mark item as "Coming Soon". Non-zero prices convert to integer paisa (NPR × 100).
            </span>
          </div>

          {/* SEO Meta Description */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-2">
              SEO Description (Dynamic Metadata Engine)
            </label>
            <textarea
              rows={3}
              placeholder="High-converting description for Nepalese Google crawlers..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white border-2 border-gray-400 rounded-xl px-4 py-3 text-sm font-bold text-black focus:outline-none focus:border-black placeholder-gray-500"
            />
          </div>

          {/* Direct Image Upload Input */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-black mb-2">
              Product Image (Direct File Upload from Device)
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="flex items-center justify-center space-x-2 px-5 py-3.5 bg-yellow-500 hover:bg-yellow-600 text-black border-2 border-black rounded-xl text-xs font-extrabold cursor-pointer flex-shrink-0">
                {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : <Upload className="w-4 h-4 text-black" />}
                <span>Direct Upload File</span>
                <input type="file" accept="image/*" onChange={handleDirectImageUpload} className="hidden" />
              </label>

              <input
                type="text"
                placeholder="Or paste asset URL / path..."
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full bg-white border-2 border-gray-400 rounded-xl px-4 py-3 text-xs font-extrabold text-black focus:outline-none focus:border-black font-mono"
              />
            </div>

            {/* Image Preview */}
            {formData.image_url && (
              <div className="mt-3 flex items-center space-x-3 p-3 bg-gray-100 border-2 border-gray-300 rounded-xl">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-400 flex-shrink-0 bg-white">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-extrabold text-black block">
                    Upload Ready
                  </span>
                  <span className="text-xs font-mono text-gray-700 font-bold truncate block">
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
            className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 border-2 border-black disabled:opacity-50 text-black font-extrabold rounded-xl text-sm flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Injecting into Turso Database...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Inject Product into Turso</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
