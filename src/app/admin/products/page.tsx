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
  Trash2,
  Star,
  ShieldAlert,
  Images,
  AlertTriangle,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { PILLARS } from "@/lib/taxonomy";

interface ProductItem {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description?: string | null;
  price_npr: number;
  compare_at_npr?: number | null;
  cost_npr?: number | null;
  price_range?: string | null;
  category_id?: string | null;
  line: string;
  status: string;
  heroImageUrl?: string | null;
  secondaryImageUrls?: string[] | null;
  imageUrl?: string | null;
  imageUrls?: string[] | null;
}

const BLANK_FORM = {
  id: "",
  sku: "",
  name: "",
  slug: "",
  category_id: "",
  line: "traffic",
  price_npr: "",
  compare_at_npr: "",
  cost_npr: "",
  price_range: "",
  opening_stock: "",
  heroImageUrl: "",
  secondaryImageUrls: [] as string[],
  description: "",
  status: "active",
};

/** Reads the API response whether it is JSON, an HTML error page, or a non-200. */
async function readApiResult(res: Response) {
  const body = await res
    .json()
    .catch(() => ({ success: false, error: `Server returned HTTP ${res.status} ${res.statusText}.` }));
  const ok = res.ok && body?.success === true;
  return { ok, body, error: body?.error || `Request failed with HTTP ${res.status}.` };
}

export default function AdminProductsPage() {
  const [productList, setProductList] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lineFilter, setLineFilter] = useState<"all" | "traffic" | "eyewear" | "profit">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Create Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State with Category, Hero vs Secondary Images & Price Range Support
  const [formData, setFormData] = useState({ ...BLANK_FORM });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const { ok, body, error } = await readApiResult(res);
      if (ok) {
        setProductList(body.products || []);
      } else {
        setFeedbackMsg({ type: "error", text: error });
      }
    } catch (err) {
      console.error("Failed to load admin products:", err);
      setFeedbackMsg({ type: "error", text: "Network error loading the catalog from the database." });
    } finally {
      setLoading(false);
    }
  };

  /** Picking a category also sets the matching product line, so the two can't drift apart. */
  const handleCategoryChange = (categoryId: string) => {
    const pillar = PILLARS.find((p) => p.id === categoryId);
    setFormData((prev) => ({
      ...prev,
      category_id: categoryId,
      line: pillar ? (pillar.slug === "eyewear" ? "eyewear" : pillar.line) : prev.line,
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    const hero = p.heroImageUrl || p.imageUrl || "/products/ikonic_straightener_1786231866243.jpg";
    const secondaries = p.secondaryImageUrls && p.secondaryImageUrls.length > 0 
      ? p.secondaryImageUrls 
      : (p.imageUrls || []).filter((u) => u !== hero);
    
    setFormData({
      ...BLANK_FORM,
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      category_id: p.category_id || "",
      line: p.line || "traffic",
      price_npr: (p.price_npr / 100).toString(),
      compare_at_npr: p.compare_at_npr ? (p.compare_at_npr / 100).toString() : "",
      cost_npr: p.cost_npr ? (p.cost_npr / 100).toString() : "",
      price_range: p.price_range || "",
      heroImageUrl: hero,
      secondaryImageUrls: secondaries,
      description: p.description || "",
      status: p.status || "active",
    });
    setShowEditModal(true);
  };

  const handleConfirmDelete = (p: ProductItem) => {
    setDeletingProduct(p);
    setShowDeleteModal(true);
  };

  const handleExecuteDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch(`/api/admin/products?id=${deletingProduct.id}`, {
        method: "DELETE",
      });
      const { ok, error } = await readApiResult(res);

      if (ok) {
        setFeedbackMsg({
          type: "success",
          text: `Product "${deletingProduct.name}" and all associated images and pages were permanently deleted!`,
        });
        setShowDeleteModal(false);
        setDeletingProduct(null);
        fetchProducts();
      } else {
        setFeedbackMsg({ type: "error", text: error });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to delete product." });
    } finally {
      setIsDeleting(false);
    }
  };

  // Hero File Upload Handler with SHA-256 Validation
  const handleDirectHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (res.status === 409 || json.isDuplicate) {
        setFeedbackMsg({
          type: "error",
          text: json.error || `Duplicate asset detected! SHA-256 hash match on catalog asset "${json.existingUrl}".`,
        });
      } else if (json.success && json.url) {
        setFormData((prev) => ({ ...prev, heroImageUrl: json.url }));
        setFeedbackMsg({
          type: "success",
          text: `Hero Image uploaded & verified unique! (SHA-256: ${json.hash?.slice(0, 10)}...)`,
        });
      } else {
        setFeedbackMsg({ type: "error", text: json.error || "Failed to upload Hero image file." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to upload Hero image file." });
    } finally {
      setUploadingImage(false);
    }
  };

  // Secondary Files Upload Handler with SHA-256 Validation
  const handleDirectSecondaryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setFeedbackMsg(null);

    const uploadedUrls: string[] = [];
    let duplicateCount = 0;

    try {
      for (let i = 0; i < files.length; i++) {
        const data = new FormData();
        data.append("image", files[i]);

        const res = await fetch("/api/admin/upload-image", {
          method: "POST",
          body: data,
        });

        const json = await res.json();
        if (res.status === 409 || json.isDuplicate) {
          duplicateCount++;
        } else if (json.success && json.url) {
          uploadedUrls.push(json.url);
        }
      }

      if (uploadedUrls.length > 0) {
        setFormData((prev) => ({
          ...prev,
          secondaryImageUrls: Array.from(new Set([...prev.secondaryImageUrls, ...uploadedUrls])),
        }));
        setFeedbackMsg({
          type: "success",
          text: `${uploadedUrls.length} secondary image(s) uploaded successfully!${
            duplicateCount > 0 ? ` (${duplicateCount} duplicate files skipped by SHA-256)` : ""
          }`,
        });
      } else if (duplicateCount > 0) {
        setFeedbackMsg({
          type: "error",
          text: `Upload rejected: All ${duplicateCount} selected file(s) already exist in catalog (SHA-256 hash match).`,
        });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err.message || "Failed to upload secondary image files." });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveSecondaryImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      secondaryImageUrls: prev.secondaryImageUrls.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSwapSecondaryToHero = (indexToSwap: number) => {
    setFormData((prev) => {
      const oldHero = prev.heroImageUrl;
      const target = prev.secondaryImageUrls[indexToSwap];
      const updatedSecondaries = prev.secondaryImageUrls.filter((_, idx) => idx !== indexToSwap);
      if (oldHero) updatedSecondaries.push(oldHero);

      return {
        ...prev,
        heroImageUrl: target,
        secondaryImageUrls: updatedSecondaries,
      };
    });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      setFeedbackMsg({ type: "error", text: "Pick a category. Without one the product never appears on any /c/ category page." });
      return;
    }
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const { ok, body, error } = await readApiResult(res);

      if (ok) {
        setFeedbackMsg({
          type: "success",
          text: body.message || `Product "${formData.name}" added successfully!`,
        });
        setShowAddModal(false);
        fetchProducts();
      } else {
        setFeedbackMsg({ type: "error", text: error });
      }
    } catch (err) {
      setFeedbackMsg({ type: "error", text: "Network error creating product." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category_id) {
      setFeedbackMsg({ type: "error", text: "Pick a category. Without one the product never appears on any /c/ category page." });
      return;
    }
    setIsSubmitting(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const { ok, body, error } = await readApiResult(res);

      if (ok) {
        setFeedbackMsg({
          type: "success",
          text: body.message || `Product "${formData.name}" updated successfully!`,
        });
        setShowEditModal(false);
        fetchProducts();
      } else {
        setFeedbackMsg({ type: "error", text: error });
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
    const matchesLine =
      lineFilter === "all"
        ? true
        : lineFilter === "traffic"
        ? p.line === "traffic" || p.line === "eyewear"
        : lineFilter === "eyewear"
        ? p.line === "eyewear"
        : p.line === lineFilter;
    const matchesCategory =
      categoryFilter === "all"
        ? true
        : categoryFilter === "none"
        ? !p.category_id
        : p.category_id === categoryFilter;
    return matchesSearch && matchesLine && matchesCategory;
  });

  const uncategorisedCount = productList.filter((p) => !p.category_id).length;

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
                setFormData({ ...BLANK_FORM });
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
              {feedbackMsg.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-green-800 flex-shrink-0" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-red-800 flex-shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="font-extrabold underline ml-4">
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

          <div className="flex flex-wrap gap-2 text-xs">
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
              onClick={() => setLineFilter("eyewear")}
              className={`px-3 py-2 rounded-lg border-2 font-extrabold transition-none ${
                lineFilter === "eyewear" ? "border-black bg-yellow-400 text-black" : "border-gray-300 bg-white text-gray-800"
              }`}
            >
              Eyewear Only ({productList.filter((p) => p.line === "eyewear").length})
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

        {/* Category Filter Strip — driven by the 5-pillar taxonomy */}
        <div className="p-4 rounded-xl bg-white border-2 border-gray-300 space-y-2.5">
          <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider block">
            Filter by Official Category
          </span>
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-2 rounded-lg border-2 font-extrabold transition-none ${
                categoryFilter === "all" ? "border-black bg-yellow-400 text-black" : "border-gray-300 bg-white text-gray-800"
              }`}
            >
              All Categories
            </button>
            {PILLARS.map((pillar) => (
              <button
                key={pillar.id}
                onClick={() => setCategoryFilter(pillar.id)}
                className={`px-3 py-2 rounded-lg border-2 font-extrabold transition-none ${
                  categoryFilter === pillar.id ? "border-black bg-yellow-400 text-black" : "border-gray-300 bg-white text-gray-800"
                }`}
              >
                {pillar.name} ({productList.filter((p) => p.category_id === pillar.id).length})
              </button>
            ))}
            <button
              onClick={() => setCategoryFilter("none")}
              className={`px-3 py-2 rounded-lg border-2 font-extrabold transition-none ${
                categoryFilter === "none"
                  ? "border-black bg-red-500 text-white"
                  : uncategorisedCount > 0
                  ? "border-red-400 bg-red-50 text-red-900"
                  : "border-gray-300 bg-white text-gray-800"
              }`}
            >
              Uncategorised ({uncategorisedCount})
            </button>
          </div>
        </div>

        {/* Product Listing Table */}
        <div className="rounded-xl bg-white border-2 border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[900px]">
              <thead>
                <tr className="bg-gray-200 text-gray-900 uppercase font-extrabold border-b-2 border-gray-400">
                  <th className="py-3.5 px-4">Image & Product</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Category</th>
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
                    <td colSpan={8} className="py-12 text-center text-gray-800 font-extrabold">
                      Loading backend catalog products...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-800 font-extrabold">
                      No products matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-yellow-50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-400 flex-shrink-0 relative">
                            <img
                              src={p.heroImageUrl || p.imageUrl || "/products/ikonic_straightener_1786231866243.jpg"}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                            {p.secondaryImageUrls && p.secondaryImageUrls.length > 0 && (
                              <span className="absolute bottom-0 right-0 bg-black text-white text-[9px] font-mono px-1 rounded-tl font-bold flex items-center">
                                +{p.secondaryImageUrls.length}
                              </span>
                            )}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-black block line-clamp-1">{p.name}</span>
                            <span className="text-xs text-gray-600 font-mono font-bold">/p/{p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-black">{p.sku}</td>
                      <td className="py-3.5 px-4">
                        {(() => {
                          const pillar = PILLARS.find((c) => c.id === p.category_id);
                          return pillar ? (
                            <span className="px-2.5 py-1 rounded text-xs font-extrabold uppercase bg-gray-200 text-gray-900 border border-gray-400 inline-block">
                              {pillar.name}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded text-xs font-extrabold uppercase bg-red-200 text-red-900 border border-red-500 inline-flex items-center">
                              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Uncategorised
                            </span>
                          );
                        })()}
                      </td>
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

                          {/* DELETE PRODUCT BUTTON */}
                          <button
                            onClick={() => handleConfirmDelete(p)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white border-2 border-red-900 font-extrabold text-xs flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingProduct && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-red-600 rounded-2xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl text-gray-900">
              <div className="flex items-center space-x-3 text-red-600">
                <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                <h2 className="text-xl font-extrabold text-black">Delete Product Permanently?</h2>
              </div>

              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl space-y-2">
                <span className="text-xs font-mono uppercase text-red-800 font-extrabold block">SKU: {deletingProduct.sku}</span>
                <p className="text-sm font-extrabold text-black">{deletingProduct.name}</p>
                <p className="text-xs text-red-900 font-bold">
                  This action will permanently delete this product, all its image records in Turso, inventory rows, and its storefront landing pages. This cannot be undone.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t-2 border-gray-300">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2.5 rounded-xl border-2 border-gray-400 font-extrabold text-xs text-black bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteDelete}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs border-2 border-red-900 flex items-center space-x-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Deleting Product...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 text-white" />
                      <span>Confirm & Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className={`w-full bg-white border-2 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none ${
                        formData.category_id ? "border-gray-400" : "border-red-500"
                      }`}
                    >
                      <option value="">Select a category…</option>
                      {PILLARS.map((pillar) => (
                        <option key={pillar.id} value={pillar.id}>
                          {pillar.name}
                        </option>
                      ))}
                    </select>
                    {!formData.category_id && (
                      <span className="text-[11px] font-extrabold text-red-700 mt-1 block">
                        This product has no category, so it is invisible on every /c/ page. Pick one.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                      Product Line *
                    </label>
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

                <div>
                  <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                    Category Price Range Text (e.g. NPR 115,000 – NPR 145,000)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NPR 115,000 – NPR 145,000"
                    value={formData.price_range}
                    onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
                    className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none font-mono"
                  />
                </div>

                {/* 1. HERO COVER IMAGE SELECTION (SHA-256 PROTECTED) */}
                <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-600 fill-yellow-600" /> Hero Cover Image (Main Left Display)
                    </label>
                    <span className="text-[10px] font-mono text-yellow-800 font-extrabold">SHA-256 Hash Checked</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl text-xs font-extrabold border-2 border-black cursor-pointer flex-shrink-0">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Upload Hero File</span>
                      <input type="file" accept="image/*" onChange={handleDirectHeroUpload} className="hidden" />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste Hero Image URL..."
                      value={formData.heroImageUrl}
                      onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-2.5 text-xs focus:border-black focus:outline-none font-mono"
                    />
                  </div>

                  {formData.heroImageUrl && (
                    <div className="flex items-center justify-between p-2 bg-white border border-yellow-400 rounded-lg">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="w-12 h-12 rounded overflow-hidden border border-gray-400 flex-shrink-0 bg-gray-100">
                          <img src={formData.heroImageUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-mono font-bold text-black truncate">{formData.heroImageUrl}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, heroImageUrl: "" }))}
                        className="text-red-700 hover:underline font-extrabold text-xs flex items-center ml-2 flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-0.5" /> Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. SECONDARY THUMBNAIL IMAGES (SHA-256 PROTECTED) */}
                <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider flex items-center">
                      <Images className="w-4 h-4 mr-1 text-gray-700" /> Secondary Images Gallery ({formData.secondaryImageUrls.length} Thumbnails)
                    </label>
                    <span className="text-[10px] font-mono text-gray-600 font-extrabold">Arranged Under Hero Box</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-black rounded-xl text-xs font-extrabold border-2 border-gray-400 cursor-pointer flex-shrink-0">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Add Secondary Files</span>
                      <input type="file" multiple accept="image/*" onChange={handleDirectSecondaryUpload} className="hidden" />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste Secondary URL and press Enter..."
                      onKeyDown={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (e.key === "Enter" && target.value.trim()) {
                          e.preventDefault();
                          const newUrl = target.value.trim();
                          setFormData((prev) => ({
                            ...prev,
                            secondaryImageUrls: Array.from(new Set([...prev.secondaryImageUrls, newUrl])),
                          }));
                          target.value = "";
                        }
                      }}
                      className="w-full bg-white border-2 border-gray-400 text-black font-bold rounded-xl p-2.5 text-xs focus:border-black focus:outline-none font-mono"
                    />
                  </div>

                  {/* Secondary Thumbnails Grid */}
                  {formData.secondaryImageUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {formData.secondaryImageUrls.map((url, idx) => (
                        <div key={`sec-${idx}`} className="relative bg-white border-2 border-gray-300 rounded-xl p-2 flex flex-col space-y-2">
                          <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
                            <img src={url} alt={`Secondary Photo ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute top-1 left-1 bg-black text-white font-bold text-[9px] px-1.5 py-0.5 rounded font-mono">
                              #{idx + 1}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => handleSwapSecondaryToHero(idx)}
                              className="text-yellow-700 hover:underline font-extrabold"
                            >
                              Make Hero
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSecondaryImage(idx)}
                              className="text-red-700 hover:underline font-extrabold flex items-center"
                            >
                              <Trash2 className="w-3 h-3 mr-0.5" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
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

        {/* Add Product Modal */}
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
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">Category *</label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className={`w-full bg-white border-2 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none ${
                        formData.category_id ? "border-gray-400" : "border-red-500"
                      }`}
                    >
                      <option value="">Select a category…</option>
                      {PILLARS.map((pillar) => (
                        <option key={pillar.id} value={pillar.id}>
                          {pillar.name}
                        </option>
                      ))}
                    </select>
                    {!formData.category_id && (
                      <span className="text-[11px] font-extrabold text-red-700 mt-1 block">
                        Required. A product with no category never shows on any /c/ page.
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <span className="text-[11px] font-bold text-gray-600 mt-1 block">
                      Auto-set from the category. Override only if this item sells on a different line.
                    </span>
                  </div>

                  <div>
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">
                      Opening Stock (Units at Kathmandu Warehouse)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={formData.opening_stock}
                      onChange={(e) => setFormData({ ...formData, opening_stock: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-3 text-sm focus:border-black focus:outline-none"
                    />
                    <span className="text-[11px] font-bold text-gray-600 mt-1 block">
                      Blank saves 0 units. Adjust later in Inventory Studio.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-extrabold text-black text-xs uppercase tracking-wider mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ray-Ban Tech Carbon Fiber Polarized / Oakley Radar EV Path"
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

                {/* 1. HERO COVER IMAGE SELECTION */}
                <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-600 fill-yellow-600" /> Hero Cover Image (Main Display)
                    </label>
                    <span className="text-[10px] font-mono text-yellow-800 font-extrabold">SHA-256 Hash Checked</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-black rounded-xl text-xs font-extrabold border-2 border-black cursor-pointer flex-shrink-0">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Upload Hero File</span>
                      <input type="file" accept="image/*" onChange={handleDirectHeroUpload} className="hidden" />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste Hero Image URL..."
                      value={formData.heroImageUrl}
                      onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                      className="w-full bg-white border-2 border-gray-400 text-black font-extrabold rounded-xl p-2.5 text-xs focus:border-black focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* 2. SECONDARY THUMBNAILS SELECTION */}
                <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block font-extrabold text-black text-xs uppercase tracking-wider flex items-center">
                      <Images className="w-4 h-4 mr-1 text-gray-700" /> Secondary Images Gallery ({formData.secondaryImageUrls.length} Thumbnails)
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-black rounded-xl text-xs font-extrabold border-2 border-gray-400 cursor-pointer flex-shrink-0">
                      {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                      <span>Add Secondary Files</span>
                      <input type="file" multiple accept="image/*" onChange={handleDirectSecondaryUpload} className="hidden" />
                    </label>

                    <input
                      type="text"
                      placeholder="Or paste Secondary URL and press Enter..."
                      onKeyDown={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (e.key === "Enter" && target.value.trim()) {
                          e.preventDefault();
                          const newUrl = target.value.trim();
                          setFormData((prev) => ({
                            ...prev,
                            secondaryImageUrls: Array.from(new Set([...prev.secondaryImageUrls, newUrl])),
                          }));
                          target.value = "";
                        }
                      }}
                      className="w-full bg-white border-2 border-gray-400 text-black font-bold rounded-xl p-2.5 text-xs focus:border-black focus:outline-none font-mono"
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
