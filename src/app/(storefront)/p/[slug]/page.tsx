import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/storefront/Header";
import { Footer } from "@/components/storefront/Footer";
import { db, initTables } from "@/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ProductColorSelector } from "@/components/storefront/ProductColorSelector";
import { ChevronRight } from "lucide-react";

export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  await initTables();
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const product = await db.select().from(products).where(eq(products.slug, slug)).get();
  if (!product) {
    notFound();
  }

  const category = product.category_id
    ? await db.select().from(categories).where(eq(categories.id, product.category_id)).get()
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      <Header />

      <main className="flex-1 py-10 container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="text-xs text-outline mb-8 flex items-center space-x-2">
          <Link href="/" className="hover:underline">Home</Link>
          <ChevronRight className="w-3 h-3 text-outline" />
          {category && (
            <>
              <Link href={`/c/${category.slug}`} className="hover:underline capitalize">{category.name}</Link>
              <ChevronRight className="w-3 h-3 text-outline" />
            </>
          )}
          <span className="text-on-surface font-semibold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Product Color Selection & Interactive Showcase */}
        <ProductColorSelector product={product} categoryName={category?.name} />
      </main>

      <Footer />
    </div>
  );
}
