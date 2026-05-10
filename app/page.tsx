import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { ProductCard } from "@/components/ProductCard";
import { db } from "@/src/db";
import { products } from "@/src/db/schema";

export default async function HomePage() {
  const featured = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      brand: products.brand,
      price: products.price,
      imageUrl: products.imageUrl,
      stock: products.stock,
    })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.id))
    .limit(4);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 px-6 py-10 text-white shadow-lg">
        <h1 className="text-3xl font-bold tracking-tight">
          Digital accessories, mock data ready for Fabric
        </h1>
        <p className="mt-3 max-w-xl text-sm text-sky-100">
          Browse cables, chargers, peripherals, and mobile gear. Cart stays in
          your browser; confirmed checkouts write clean sales rows to Postgres
          for Bronze → Silver → Gold modeling practice.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-50"
          >
            View catalog
          </Link>
          <Link
            href="/register"
            className="rounded-lg border border-white/40 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
          >
            Create account
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Featured products
          </h2>
          <Link
            href="/products"
            className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-400"
          >
            See all
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
