"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmPurchase } from "@/app/actions/purchase";
import { useCart } from "@/components/CartContext";

export function ConfirmPurchaseButton({ loggedIn }: { loggedIn: boolean }) {
  const router = useRouter();
  const { lines, clear, hydrated } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    if (!loggedIn) {
      router.push("/login?next=/cart");
      return;
    }
    if (!hydrated) return;
    if (!lines.length) {
      setError("Your cart is empty.");
      return;
    }
    setPending(true);
    try {
      const result = await confirmPurchase(lines);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      clear();
      router.push(`/purchases/${result.saleId}?new=1`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-2">
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
      <button
        type="button"
        disabled={pending || !hydrated}
        onClick={onClick}
        className="w-full rounded-lg bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Processing…" : "Confirm purchase"}
      </button>
    </div>
  );
}
