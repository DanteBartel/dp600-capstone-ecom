"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "dp600-mock-cart";

export type CartLine = { productId: number; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  hydrated: boolean;
  add: (productId: number, quantity: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  totalQuantity: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function parseStored(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    const lines: CartLine[] = [];
    for (const row of data) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      const productId = Math.floor(Number(r.productId));
      const quantity = Math.floor(Number(r.quantity));
      if (!Number.isFinite(productId) || productId <= 0) continue;
      if (!Number.isFinite(quantity) || quantity <= 0) continue;
      lines.push({ productId, quantity });
    }
    return lines;
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    startTransition(() => {
      setLines(parseStored(localStorage.getItem(STORAGE_KEY)));
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const add = useCallback((productId: number, quantity: number) => {
    const q = Math.max(1, Math.floor(quantity));
    setLines((prev) => {
      const next = [...prev];
      const i = next.findIndex((l) => l.productId === productId);
      if (i >= 0) next[i] = { productId, quantity: next[i]!.quantity + q };
      else next.push({ productId, quantity: q });
      return next;
    });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    const q = Math.floor(quantity);
    setLines((prev) => {
      if (q <= 0) return prev.filter((l) => l.productId !== productId);
      return prev.map((l) =>
        l.productId === productId ? { ...l, quantity: q } : l,
      );
    });
  }, []);

  const remove = useCallback((productId: number) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const totalQuantity = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines],
  );

  const value = useMemo(
    () => ({
      lines,
      hydrated,
      add,
      setQuantity,
      remove,
      clear,
      totalQuantity,
    }),
    [lines, hydrated, add, setQuantity, remove, clear, totalQuantity],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
