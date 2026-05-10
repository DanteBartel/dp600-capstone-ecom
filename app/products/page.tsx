import Link from "next/link";
import { and, asc, eq, ilike, or, type SQL } from "drizzle-orm";
import { ProductCard } from "@/components/ProductCard";
import { db } from "@/src/db";
import { categories, products } from "@/src/db/schema";

type SearchParams = { q?: string; category?: string };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams | Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const categorySlug = (sp.category ?? "").trim();

  const categoryRows = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(asc(categories.name));

  const conditions: SQL[] = [eq(products.isActive, true)];

  if (categorySlug) {
    const cat = categoryRows.find((c) => c.slug === categorySlug);
    if (cat) conditions.push(eq(products.categoryId, cat.id));
  }

  if (q) {
    const pattern = `%${q.replaceAll("%", "\\%")}%`;
    conditions.push(
      or(
        ilike(products.name, pattern),
        ilike(products.brand, pattern),
        ilike(products.sku, pattern),
      )!,
    );
  }

  const whereClause =
    conditions.length === 1 ? conditions[0]! : and(...conditions);

  const list = await db
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
    .where(whereClause)
    .orderBy(asc(products.name));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Filter by category or search by name, brand, or SKU.
        </p>
      </div>

      <form
        method="get"
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <label className="block flex-1 text-sm">
          <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
            Search
          </span>
          <input
            name="q"
            defaultValue={q}
            placeholder="e.g. USB, Anker, mouse…"
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="block w-full text-sm sm:w-52">
          <span className="mb-1 block font-medium text-zinc-700 dark:text-zinc-300">
            Category
          </span>
          <select
            name="category"
            defaultValue={categorySlug}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">All</option>
            {categoryRows.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          Apply
        </button>
        <Link
          href="/products"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Reset
        </Link>
      </form>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {list.length} product{list.length === 1 ? "" : "s"}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
