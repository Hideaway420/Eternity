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
  X,
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
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Near-White Global Backend Navigation Bar */}
      <AdminHeader />

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Sub Header Action Bar */}
        <div className="bg-white rounded-xl p-5 border-2 border-gray-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Link href="/admin" className="text-xs font-bold text-gray-700 hover:text-black flex items-center">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Admin Dashboard
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight mt-1 flex items-center">
              <PackageCheck className="w-7 h-7 mr-3 text-yellow-600" /> Catalog & Products Management
            </h1>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Link
              href="/admin/inventory-studio"
              className="px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 border-2 border-gray-400 text-black font-extrabold text-xs flex items-center space-x-1"
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
              className="px-5 py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold text-xs border-2 border-yellow-700 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {feedbackMsg && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border-2 ${
              feedbackMsg.type === "success"
                ? "bg-green-100 text-green-900 border-green-400"
                : "bg-red-100 text-red-900 border-red-400"
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-800" />
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="font-extrabold underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-white border-2 border-gray-300">
            <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">Total Catalog Items</span>
            <div className="text-3xl font-extrabold text-black mt-1">{productList.length}</div>
            <span className="text-xs text-green-800 font-bold mt-1 block">Active in Storefront</span>
          </div>

          <div className="p-5 rounded-xl bg-white border-2 border-gray-300">
            <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">D2C Styling Tools & Eyewear</span>
            <div className="text-3xl font-extrabold text-yellow-700 mt-1">
              {productList.filter((p) => p.line === "traffic" || p.line === "eyewear").length}
            </div>
            <span className="text-xs text-gray-800 font-bold mt-1 block">Traffic Line</span>
          </div>

          <div className="p-5 rounded-xl bg-white border-2 border-yellow-500">
            <span className="text-xs font-extrabold text-yellow-800 uppercase tracking-wider block">Salon Furniture</span>
            <div className="text-3xl font-extrabold text-black mt-1">
              {productList.filter((p) => p.line === "profit").length}
            </div>
            <span className="text-xs text-gray-800 font-bold mt-1 block">High-Margin B2B Equipment</span>
          </div>
        </div>

        {/* Filter & Search Strip */}
        <div className="p-4 rounded-xl bg-white border-2 border-gray-300 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search product name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-gray-400 text-black font-bold rounded-xl py-2.5 pl-9 pr-4 text-xs focus:outline-none focus:border-black"
            />
            <Search className="w-4 h-4 text-gray-700 absolute left-3 top-3" />
          </div>

          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setLineFilter("all")}
              className={`px-3 py-2 rounded-lg border-2 font-extrabold transition-none ${
                lineFilter === "all" ? "border-black bg-yellow-400 text-black" : "border-gray-300 bg-white text-gray-800"
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setLineFilter("traffic")}
              className={`px-3 py-2 rounded-lg border-2 font-extrabold transition-none ${
                lineFilter === "traffic" ? "border-black bg-yellow-400 text-black" : "border-gray-300 bg-white text-gray-800"
              }`}
            >
              Styling Tools & Eyewear
            </button>
            <button
              onClick={() => setLineFilter("profit")}
              className={`px-3 py-2 rounded-lg border-2 font-extrabold transition-none ${
                lineFilter === "profit" ? "border-black bg-yellow-400 text-black" : "border-gray-300 bg-white text-gray-800"
              }`}
            >
              Salon Equipment
            </button>
          </div>
        </div>

        {/* Product Listing Table */}
        <div className="rounded-xl bg-white border-2 border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[700px]">
              <thead>
                <tr className="bg-gray-200 text-gray-900 uppercase font-extrabold border-b-2 border-gray-400">
                  <th className="py-3.5 px-4">Image & Product</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Line</th>
                  <th className="py-3.5 px-4">Retail Price (NPR)</th>
                  <th className="py-3.5 px-4">Daraz Anchor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-800 font-extrabold">
                      Loading backend catalog products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-800 font-extrabold">
                      No products matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-yellow-50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-400 flex-shrink-0">
                            <img
                              src={p.imageUrl || "/products/ikonic_straightener_1786231866243.jpg"}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-black block line-clamp-1">{p.name}</span>
                            <span className="text-xs text-gray-600 font-mono font-bold">/p/{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-black">{p.sku}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-extrabold uppercase ${
                            p.line === "profit" ? "bg-purple-200 text-purple-900 border border-purple-400" : "bg-yellow-200 text-yellow-900 border border-yellow-400"
                          }`}
                        >
                          {p.line === "profit" ? "B2B Equipment" : "D2C Tool"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-sm text-black">{formatNpr(p.price_npr)}</td>
                      <td className="py-3.5 px-4 text-gray-700 font-mono font-bold">
                        {p.compare_at_npr ? formatNpr(p.compare_at_npr) : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-extrabold uppercase ${
                            p.status === "active" ? "bg-green-200 text-green-900 border border-green-400" : "bg-amber-200 text-amber-900 border border-amber-400"
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
                            className="px-3 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black font-extrabold text-xs flex items-center space-x-1"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <Link
                            href={`/p/${p.slug}`}
                            target="_blank"
                            className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 border-2 border-gray-400 font-extrabold text-xs text-black inline-block"
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

        {/* Edit Product Modal - ULTRA HIGH CONTRAST & STATIC */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto space-y-6 shadow-2xl text-gray-900">
              <div className="flex justify-between items-center border-b-2 border-gray-300 pb-4">
                <div>
                  <span className="text-xs font-mono uppercase text-yellow-700 font-extrabold">Product ID: {editingProduct.id}</span>
                  <h2 className="text-2xl font-extrabold text-black flex items-center mt-1">
                    <Pencil className="w-6 h-6 mr-2 text-yellow-600" /> Edit Product Details
                  </h2>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-xs font-extrabold px-3 py-1.5 bg-gray-200 hover:bg-gray-300 border-2 border-gray-400 rounded-lg text-black flex items-center"
                >
                  <X className="w-4 h-4 mr-1" /> Close
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                      SKU *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                    >
                      <option value="active">Active (In Stock)</option>
                      <option value="out_of_stock">Out of Stock / Coming Soon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                      Retail Price (NPR) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.price_npr}
                      onChange={(e) => setFormData({ ...formData, price_npr: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                      Daraz Anchor Price (NPR)
                    </label>
                    <input
                      type="number"
                      value={formData.compare_at_npr}
                      onChange={(e) => setFormData({ ...formData, compare_at_npr: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                      Trade Cost (NPR)
                    </label>
                    <input
                      type="number"
                      value={formData.cost_npr}
                      onChange={(e) => setFormData({ ...formData, cost_npr: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Direct Image Upload Field */}
                <div>
                  <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                    Product Image (Direct Device File Upload)
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex items-center justify-center space-x-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl text-xs font-extrabold border-2 border-black cursor-pointer flex-shrink-0">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Choose New Image</span>
                      <input type="file" accept="image/*" onChange={handleDirectImageUpload} className="hidden" />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste image URL..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-bold rounded-xl p-3 text-xs focus:border-black focus:outline-none font-mono"
                    />
                  </div>

                  {formData.imageUrl && (
                    <div className="mt-3 flex items-center space-x-3 p-3 bg-gray-100 border-2 border-gray-300 rounded-xl">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-white border border-gray-400 flex-shrink-0">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-mono font-bold text-black truncate">{formData.imageUrl}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                    Full Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white border-2 border-gray-400 text-black font-bold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t-2 border-gray-300">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-3 rounded-xl border-2 border-gray-400 font-extrabold text-xs text-black bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage}
                    className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold text-xs border-2 border-black flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
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

        {/* Add Product Modal - ULTRA HIGH CONTRAST */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[95vh] overflow-y-auto space-y-5 shadow-2xl text-gray-900">
              <div className="flex justify-between items-center border-b-2 border-gray-300 pb-4">
                <h2 className="text-2xl font-extrabold text-black flex items-center">
                  <Plus className="w-6 h-6 mr-2 text-yellow-600" /> Add New Catalog Product
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-xs font-extrabold px-3 py-1.5 bg-gray-200 hover:bg-gray-300 border-2 border-gray-400 rounded-lg text-black flex items-center"
                >
                  <X className="w-4 h-4 mr-1" /> Close
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">SKU *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ETP-110"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">Product Line *</label>
                    <select
                      value={formData.line}
                      onChange={(e) => setFormData({ ...formData, line: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                    >
                      <option value="traffic">D2C Hair Styling Tool (Traffic Line)</option>
                      <option value="eyewear">D2C Premium Eyewear (Traffic Line)</option>
                      <option value="profit">B2B Salon Furniture / Equipment (Profit Line)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ikonic Professional Pro Titanium Shine 4.0"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">Retail Price (NPR) *</label>
                    <input
                      type="number"
                      required
                      placeholder="12920"
                      value={formData.price_npr}
                      onChange={(e) => setFormData({ ...formData, price_npr: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">Daraz Anchor Price (NPR)</label>
                    <input
                      type="number"
                      placeholder="14500"
                      value={formData.compare_at_npr}
                      onChange={(e) => setFormData({ ...formData, compare_at_npr: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">Trade Cost (NPR)</label>
                    <input
                      type="number"
                      placeholder="6300"
                      value={formData.cost_npr}
                      onChange={(e) => setFormData({ ...formData, cost_npr: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                    />
                  </div>
                </div>

                {/* Direct Image Upload Field */}
                <div>
                  <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">Product Main Image (Direct Device Upload)</label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex items-center justify-center space-x-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl text-xs font-extrabold border-2 border-black cursor-pointer flex-shrink-0">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Choose File</span>
                      <input type="file" accept="image/*" onChange={handleDirectImageUpload} className="hidden" />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste asset URL..."
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-bold rounded-xl p-3 text-xs focus:border-black focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">Full Description</label>
                  <textarea
                    rows={3}
                    placeholder="Official product imported directly by Eternity Products Nepal..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white border-2 border-gray-400 text-black font-bold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3 border-t-2 border-gray-300">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-3 rounded-xl border-2 border-gray-400 font-extrabold text-xs text-black bg-gray-200 hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || uploadingImage}
                    className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold text-xs border-2 border-black flex items-center space-x-2"
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
