"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatNpr } from "@/lib/money";
import {
  Plus,
  Search,
  PackageCheck,
  ArrowLeft,
  Pencil,
  Upload,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface ProductItem {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description?: string | null;
  price_npr: number;
  compare_at_npr?: number | null;
  cost_npr?: number | null;
  line: string;
  status: string;
  imageUrl?: string | null;
}

export default function AdminProductsPage() {
  const [productList, setProductList] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lineFilter, setLineFilter] = useState<"all" | "traffic" | "profit">("all");
  
  // Create Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: "",
    sku: "",
    name: "",
    slug: "",
    line: "traffic",
    price_npr: "",
    compare_at_npr: "",
    cost_npr: "",
    imageUrl: "",
    description: "",
    status: "active",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success) {
        setProductList(data.products || []);
      }
    } catch (err) {
      console.error("Failed to load admin products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setFormData({
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      line: p.line || "traffic",
      price_npr: (p.price_npr / 100).toString(),
      compare_at_npr: p.compare_at_npr ? (p.compare_at_npr / 100).toString() : "",
      cost_npr: p.cost_npr ? (p.cost_npr / 100).toString() : "",
      imageUrl: p.imageUrl || "",
      description: p.description || "",
      status: p.status || "active",
    });
    setShowEditModal(true);
  };

  // Direct Image Upload Handler for Admin Panel
  const handleDirectImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setFeedbackMsg(null);

    try {
      const data = new FormData();
      data.append("image", file);

      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: data,
      });

      const json = await res.json();

      if (json.success && json.url) {
        setFormData((prev) => ({ ...prev, imageUrl: json.url }));
        setFeedbackMsg({ type: "success", text: "Image uploaded successfully to server!" });
      } else {
        setFeedbackMsg({ type: "error", text: json.error || "Failed to upload image file." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to upload image file." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.success) {
        setFeedbackMsg({ type: "success", text: `Product "${formData.name}" added successfully!` });
        setShowAddModal(false);
        fetchProducts();
      } else {
        setFeedbackMsg({ type: "error", text: result.error || "Failed to create product." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Network error creating product." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();

      if (result.success) {
        setFeedbackMsg({ type: "success", text: `Product "${formData.name}" updated successfully!` });
        setShowEditModal(false);
        fetchProducts();
      } else {
        setFeedbackMsg({ type: "error", text: result.error || "Failed to update product." });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Network error updating product." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = productList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLine = lineFilter === "all" || p.line === lineFilter;
    return matchesSearch && matchesLine;
  });

  return (
    <div className="min-h-screen bg-[#F6F2EC] text-on-surface">
      {/* Near-White Global Backend Navigation Bar */}
      <AdminHeader />

      <main className="container mx-auto p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8">
        {/* Sub Header Action Bar */}
        <div className="bg-surface-lowest rounded-2xl p-4 sm:p-6 border border-outline-variant shadow-soft flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Link href="/admin" className="text-xs text-outline hover:underline flex items-center">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Admin Dashboard
              </Link>
            </div>
            <h1 className="font-serif text-xl sm:text-3xl font-bold tracking-tight mt-1 flex items-center">
              <PackageCheck className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-gold" /> Catalog & Products
            </h1>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Link
              href="/admin/inventory-studio"
              className="px-4 py-3 rounded-xl bg-surface-low border border-outline-variant hover:border-gold text-on-surface font-bold text-xs transition-colors flex items-center space-x-1"
            >
              <span>Inventory Studio</span>
            </Link>
            <button
              onClick={() => {
                setFormData({
                  id: "",
                  sku: "",
                  name: "",
                  slug: "",
                  line: "traffic",
                  price_npr: "",
                  compare_at_npr: "",
                  cost_npr: "",
                  imageUrl: "",
                  description: "",
                  status: "active",
                });
                setShowAddModal(true);
              }}
              className="px-5 py-3 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs shadow-gold transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
              feedbackMsg.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="font-bold underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-soft">
            <span className="text-xs font-mono text-outline uppercase tracking-wider block">Total Catalog Items</span>
            <div className="text-2xl sm:text-3xl font-bold font-sans text-on-surface mt-1.5">{productList.length}</div>
            <span className="text-[11px] text-green-700 font-semibold mt-1 block">Active in Storefront</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-surface-lowest border border-outline-variant shadow-soft">
            <span className="text-xs font-mono text-outline uppercase tracking-wider block">D2C Styling Tools & Eyewear</span>
            <div className="text-2xl sm:text-3xl font-bold font-sans text-gold mt-1.5">
              {productList.filter((p) => p.line === "traffic").length}
            </div>
            <span className="text-[11px] text-outline mt-1 block">Traffic Line</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-gold/40 shadow-soft">
            <span className="text-xs font-mono text-gold uppercase tracking-wider block">Salon Furniture</span>
            <div className="text-2xl sm:text-3xl font-bold font-sans text-on-surface mt-1.5">
              {productList.filter((p) => p.line === "profit").length}
            </div>
            <span className="text-[11px] text-outline mt-1 block">High-Margin B2B Equipment</span>
          </div>
        </div>

        {/* Filter & Search Strip */}
        <div className="p-4 rounded-2xl bg-surface-lowest border border-outline-variant flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-soft">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-low border border-outline-variant rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-gold"
            />
            <Search className="w-4 h-4 text-outline absolute left-3 top-3" />
          </div>

          <div className="flex gap-1.5 text-[11px] sm:text-xs overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setLineFilter("all")}
              className={`px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors ${
                lineFilter === "all" ? "border-gold bg-gold/15 text-on-surface" : "border-outline-variant hover:border-gold/50"
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setLineFilter("traffic")}
              className={`px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors ${
                lineFilter === "traffic" ? "border-gold bg-gold/15 text-on-surface" : "border-outline-variant hover:border-gold/50"
              }`}
            >
              Styling Tools & Eyewear
            </button>
            <button
              onClick={() => setLineFilter("profit")}
              className={`px-3 py-1.5 rounded-lg border font-semibold whitespace-nowrap transition-colors ${
                lineFilter === "profit" ? "border-gold bg-gold/15 text-on-surface" : "border-outline-variant hover:border-gold/50"
              }`}
            >
              Salon Equipment
            </button>
          </div>
        </div>

        {/* Product Listing Table */}
        <div className="rounded-2xl bg-surface-lowest border border-outline-variant overflow-hidden shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-high text-outline uppercase font-mono border-b border-outline-variant">
                  <th className="py-3.5 px-4 font-bold">Image & Product</th>
                  <th className="py-3.5 px-4 font-bold">SKU</th>
                  <th className="py-3.5 px-4 font-bold">Line</th>
                  <th className="py-3.5 px-4 font-bold">Retail Price (NPR)</th>
                  <th className="py-3.5 px-4 font-bold">Daraz Anchor</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-outline">
                      Loading backend catalog products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-outline">
                      No products matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-low/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-surface-low border border-outline-variant flex-shrink-0">
                            <img
                              src={p.imageUrl || "/products/ikonic_straightener_1786231866243.jpg"}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-serif font-bold text-xs sm:text-sm text-on-surface block line-clamp-1">{p.name}</span>
                            <span className="text-[10px] text-outline font-mono">/p/{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold">{p.sku}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase ${
                            p.line === "profit" ? "bg-purple-100 text-purple-800" : "bg-gold/20 text-on-surface"
                          }`}
                        >
                          {p.line === "profit" ? "B2B Equipment" : "D2C Tool"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold font-sans">{formatNpr(p.price_npr)}</td>
                      <td className="py-3.5 px-4 text-outline font-mono">
                        {p.compare_at_npr ? formatNpr(p.compare_at_npr) : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.status === "active" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* EDIT PRODUCT BUTTON */}
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="px-2.5 py-1.5 rounded-lg bg-gold/15 hover:bg-gold text-on-surface border border-gold/40 font-bold text-[11px] transition-colors flex items-center space-x-1"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          <Link
                            href={`/p/${p.slug}`}
                            target="_blank"
                            className="px-2.5 py-1.5 rounded-lg bg-surface-low hover:bg-gold/20 border border-outline-variant font-bold text-[11px] transition-colors inline-block"
                          >
                            View PDP
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Product Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-lowest border border-outline-variant rounded-3xl p-5 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-elevated">
              <div className="flex justify-between items-center border-b border-outline-variant pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gold font-bold">Product ID: {editingProduct.id}</span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold flex items-center mt-0.5">
                    <Pencil className="w-5 h-5 mr-2 text-gold" /> Edit Product Details
                  </h2>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-xs font-bold px-3 py-1 bg-surface-low rounded-lg hover:bg-surface-container"
                >
                  Close ✕
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-outline mb-1">SKU *</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-outline mb-1">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold"
                    >
                      <option value="active">Active (In Stock)</option>
                      <option value="out_of_stock">Out of Stock / Coming Soon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-outline mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-outline mb-1">Retail Price (NPR) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price_npr}
                      onChange={(e) => setFormData({ ...formData, price_npr: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-outline mb-1">Daraz Anchor Price (NPR)</label>
                    <input
                      type="number"
                      value={formData.compare_at_npr}
                      onChange={(e) => setFormData({ ...formData, compare_at_npr: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-outline mb-1">Trade Cost (NPR)</label>
                    <input
                      type="number"
                      value={formData.cost_npr}
                      onChange={(e) => setFormData({ ...formData, cost_npr: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Direct Image Upload Field */}
                <div>
                  <label className="block font-bold text-outline mb-1">Product Image (Direct Upload from Device)</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gold hover:bg-gold-hover text-on-surface rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm flex-shrink-0">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Choose New Image</span>
                      <input type="file" accept="image/*" onChange={handleDirectImageUpload} className="hidden" />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste asset URL..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold font-mono"
                    />
                  </div>

                  {formData.imageUrl && (
                    <div className="mt-3 flex items-center space-x-3 p-2 bg-surface-low border border-outline-variant rounded-xl">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-surface-lowest flex-shrink-0">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-mono text-outline truncate">{formData.imageUrl}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-outline mb-1">Full Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3 border-t border-outline-variant/60">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-3 rounded-xl border border-outline-variant font-bold text-xs hover:bg-surface-low"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage}
                    className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs shadow-gold transition-colors flex items-center space-x-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Save Product Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-surface-lowest border border-outline-variant rounded-3xl p-5 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 shadow-elevated">
              <div className="flex justify-between items-center border-b border-outline-variant pb-4">
                <h2 className="font-serif text-xl sm:text-2xl font-bold flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-gold" /> Add New Catalog Product
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-bold px-3 py-1 bg-surface-low rounded-lg hover:bg-surface-container"
                >
                  Close ✕
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-outline mb-1">SKU *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ETP-110"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-outline mb-1">Product Line *</label>
                    <select
                      value={formData.line}
                      onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold"
                    >
                      <option value="traffic">D2C Hair Styling Tool / Eyewear</option>
                      <option value="profit">B2B Salon Furniture / Equipment</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-outline mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ikonic Professional Pro Titanium Shine 4.0"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-outline mb-1">Retail Price (NPR) *</label>
                    <input
                      type="number"
                      required
                      placeholder="12920"
                      value={formData.price_npr}
                      onChange={(e) => setFormData({ ...formData, price_npr: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-outline mb-1">Daraz Anchor Price (NPR)</label>
                    <input
                      type="number"
                      placeholder="14500"
                      value={formData.compare_at_npr}
                      onChange={(e) => setFormData({ ...formData, compare_at_npr: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-outline mb-1">Trade Cost (NPR)</label>
                    <input
                      type="number"
                      placeholder="6300"
                      value={formData.cost_npr}
                      onChange={(e) => setFormData({ ...formData, cost_npr: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold"
                    />
                  </div>
                </div>

                {/* Direct Image Upload Field */}
                <div>
                  <label className="block font-bold text-outline mb-1">Product Main Image (Direct Device Upload)</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gold hover:bg-gold-hover text-on-surface rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm flex-shrink-0">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Choose File</span>
                      <input type="file" accept="image/*" onChange={handleDirectImageUpload} className="hidden" />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste asset URL..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-outline mb-1">Full Description</label>
                  <textarea
                    rows={3}
                    placeholder="Official product imported directly by Eternity Products Nepal..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-surface-low border border-outline-variant rounded-xl p-3 text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 rounded-xl border border-outline-variant font-bold text-xs hover:bg-surface-low"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage}
                    className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-hover text-on-surface font-bold text-xs shadow-gold transition-colors"
                  >
                    {isSubmitting ? "Saving Product..." : "Save Product to Catalog"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
