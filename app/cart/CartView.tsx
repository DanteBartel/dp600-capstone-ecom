"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ConfirmPurchaseButton } from "@/components/ConfirmPurchaseButton";
import { useCart } from "@/components/CartContext";
import { money, num } from "@/src/lib/money";

type CatalogRow = {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  stock: number;
  imageUrl: string;
};

export function CartView({
  catalog,
  loggedIn,
}: {
  catalog: CatalogRow[];
  loggedIn: boolean;
}) {
  const { lines, hydrated, setQuantity, remove, clear } = useCart();

  const byId = useMemo(
    () => new Map(catalog.map((p) => [p.id, p])),
    [catalog],
  );

  const rows = useMemo(() => {
    return lines
      .map((line) => {
        const p = byId.get(line.productId);
        if (!p) return null;
        return { line, p };
      })
      .filter(Boolean) as { line: { productId: number; quantity: number }; p: CatalogRow }[];
  }, [lines, byId]);

  const subtotal = useMemo(() => {
    let t = 0;
    for (const { line, p } of rows) {
      t += num(p.price) * line.quantity;
    }
    return t;
  }, [rows]);

  if (!hydrated) {
    return <p className="text-sm text-zinc-500">Loading cart…</p>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Cart</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Stored in your browser only. Confirm purchase saves one sale to the
          database.
        </p>
      </div>

      {!rows.length ? (
        <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          Your cart is empty.{" "}
          <Link href="/products" className="font-medium text-sky-700 underline dark:text-sky-400">
            Browse products
          </Link>
        </p>
      ) : (
        <div className="space-y-4">
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {rows.map(({ line, p }) => (
              <li
                key={line.productId}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/products/${p.slug}`}
                  className="flex flex-1 gap-3 min-w-0"
                >
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-zinc-200 dark:ring-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="h-full w-full object-contain p-1"
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-zinc-50">
                      {p.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {p.sku} · Stock {p.stock}
                    </p>
                    <p className="text-sm font-semibold text-sky-700 dark:text-sky-400">
                      {money(num(p.price))} each
                    </p>
                  </div>
                </Link>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <label className="flex items-center gap-1 text-sm">
                    <span className="text-zinc-500">Qty</span>
                    <input
                      type="number"
                      min={1}
                      max={p.stock}
                      value={line.quantity}
                      onChange={(e) =>
                        setQuantity(line.productId, Number(e.target.value))
                      }
                      className="w-16 rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => remove(line.productId)}
                    className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Subtotal</p>
              <p className="text-xl font-bold">{money(subtotal)}</p>
              <p className="text-xs text-zinc-500">No tax or shipping in this mock.</p>
            </div>
            <div className="flex w-full max-w-xs flex-col gap-2">
              <button
                type="button"
                onClick={() => clear()}
                className="rounded-lg border border-zinc-300 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Clear cart
              </button>
              <ConfirmPurchaseButton loggedIn={loggedIn} />
              {!loggedIn ? (
                <p className="text-center text-xs text-zinc-500">
                  <Link href="/login?next=/cart" className="text-sky-700 underline dark:text-sky-400">
                    Log in
                  </Link>{" "}
                  to check out.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
