import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { AddToCartForm } from "./AddToCartForm";
import { db } from "@/src/db";
import { categories, products } from "@/src/db/schema";
import { money, num } from "@/src/lib/money";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const rows = await db
    .select({
      id: products.id,
      sku: products.sku,
      name: products.name,
      slug: products.slug,
      brand: products.brand,
      description: products.description,
      price: products.price,
      stock: products.stock,
      imageUrl: products.imageUrl,
      isActive: products.isActive,
      categoryName: categories.name,
      categorySlug: categories.slug,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.slug, slug))
    .limit(1);

  const p = rows[0];
  if (!p || !p.isActive) notFound();

  const price = num(p.price);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.imageUrl}
          alt=""
          className="aspect-square w-full bg-white object-contain p-4"
        />
      </div>
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-400">
          {p.categoryName}
        </p>
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {p.brand} · SKU {p.sku}
        </p>
        <p className="text-3xl font-bold text-sky-700 dark:text-sky-400">
          {money(price)}
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          In stock: <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.stock}</span>
        </p>
        <p className="leading-relaxed text-zinc-800 dark:text-zinc-200">
          {p.description}
        </p>
        <AddToCartForm productId={p.id} maxQty={p.stock} />
        <Link
          href={`/products?category=${encodeURIComponent(p.categorySlug)}`}
          className="inline-block text-sm font-medium text-sky-700 hover:underline dark:text-sky-400"
        >
          More in {p.categoryName}
        </Link>
      </div>
    </div>
  );
}
