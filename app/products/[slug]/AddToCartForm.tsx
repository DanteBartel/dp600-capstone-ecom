"use client";

import { useState } from "react";
import { useCart } from "@/components/CartContext";

export function AddToCartForm({
  productId,
  maxQty,
}: {
  productId: number;
  maxQty: number;
}) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [flash, setFlash] = useState(false);

  if (maxQty <= 0) {
    return (
      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
        Temporarily out of stock.
      </p>
    );
  }

  function submit() {
    const q = Math.min(Math.max(1, qty), maxQty);
    add(productId, q);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 1500);
  }

  return (
    <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
      <label className="flex items-center gap-3 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">
          Quantity
        </span>
        <input
          type="number"
          min={1}
          max={maxQty}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="w-24 rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>
      <button
        type="button"
        onClick={submit}
        className="w-full rounded-lg bg-sky-600 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
      >
        Add to cart
      </button>
      {flash ? (
        <p className="text-center text-sm font-medium text-emerald-700 dark:text-emerald-400">
          Added to cart
        </p>
      ) : null}
    </div>
  );
}
