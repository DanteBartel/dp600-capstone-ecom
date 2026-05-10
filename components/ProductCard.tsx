import Link from "next/link";
import { money, num } from "@/src/lib/money";

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price: string;
  imageUrl: string;
  stock: number;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const price = num(product.price);
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:border-sky-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-sky-700"
    >
      <div className="aspect-square w-full overflow-hidden bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-contain p-2 transition group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {product.brand}
        </p>
        <h2 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {product.name}
        </h2>
        <p className="mt-auto text-lg font-bold text-sky-700 dark:text-sky-400">
          {money(price)}
        </p>
        <p className="text-xs text-zinc-500">Stock: {product.stock}</p>
      </div>
    </Link>
  );
}
