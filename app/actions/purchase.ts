"use server";

import { randomUUID } from "crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/src/db";
import {
  categories,
  products,
  saleItems,
  sales,
} from "@/src/db/schema";
import { getCurrentUser } from "@/src/lib/auth";
import { num, roundMoney } from "@/src/lib/money";

export type CartLineInput = { productId: number; quantity: number };

export type PurchaseResult =
  | { ok: true; saleId: number }
  | { ok: false; error: string };

function saleNumberFor(date: Date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `S-${y}${m}${d}-${randomUUID().replaceAll("-", "").slice(0, 10)}`;
}

export async function confirmPurchase(
  lines: CartLineInput[],
): Promise<PurchaseResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "You must be logged in to purchase." };

  if (!lines.length) return { ok: false, error: "Your cart is empty." };

  const normalized: { productId: number; quantity: number }[] = [];
  for (const line of lines) {
    const q = Math.floor(Number(line.quantity));
    const pid = Math.floor(Number(line.productId));
    if (!Number.isFinite(pid) || pid <= 0) continue;
    if (!Number.isFinite(q) || q <= 0) continue;
    const existing = normalized.find((l) => l.productId === pid);
    if (existing) existing.quantity += q;
    else normalized.push({ productId: pid, quantity: q });
  }

  if (!normalized.length) return { ok: false, error: "Your cart is empty." };

  const productIds = normalized.map((l) => l.productId);

  try {
    const saleId = await db.transaction(async (tx) => {
      const lockedProducts = await tx
        .select()
        .from(products)
        .where(inArray(products.id, productIds))
        .for("update");

      if (lockedProducts.length !== productIds.length) {
        throw new Error("One or more products are no longer available.");
      }

      for (const row of lockedProducts) {
        if (!row.isActive) throw new Error(`Product "${row.name}" is not available.`);
      }

      const categoryIds = [...new Set(lockedProducts.map((p) => p.categoryId))];
      const catRows = await tx
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .where(inArray(categories.id, categoryIds));
      const categoryNameById = new Map(catRows.map((c) => [c.id, c.name]));

      const byId = new Map(lockedProducts.map((p) => [p.id, p]));

      for (const line of normalized) {
        const p = byId.get(line.productId);
        if (!p) throw new Error("Invalid product in cart.");
        if (p.stock < line.quantity) {
          throw new Error(`Not enough stock for "${p.name}" (only ${p.stock} left).`);
        }
      }

      const saleDate = new Date();
      const linePayload: {
        productId: number;
        sku: string;
        productName: string;
        categoryName: string;
        brand: string;
        quantity: number;
        unitPrice: string;
        unitCost: string;
        lineTotal: string;
      }[] = [];

      let subtotal = 0;
      for (const line of normalized) {
        const p = byId.get(line.productId)!;
        const unitPrice = num(p.price);
        const unitCost = num(p.cost);
        const lineTotal = unitPrice * line.quantity;
        subtotal += lineTotal;
        linePayload.push({
          productId: p.id,
          sku: p.sku,
          productName: p.name,
          categoryName: categoryNameById.get(p.categoryId) ?? "Unknown",
          brand: p.brand,
          quantity: line.quantity,
          unitPrice: roundMoney(unitPrice),
          unitCost: roundMoney(unitCost),
          lineTotal: roundMoney(lineTotal),
        });
      }

      const subtotalStr = roundMoney(subtotal);
      const totalStr = subtotalStr;

      const saleNumber = saleNumberFor(saleDate);

      const [sale] = await tx
        .insert(sales)
        .values({
          saleNumber,
          customerId: user.customerId,
          saleDate,
          subtotal: subtotalStr,
          totalAmount: totalStr,
          city: user.city,
          district: user.district,
        })
        .returning({ id: sales.id });

      if (!sale) throw new Error("Could not create sale.");

      await tx.insert(saleItems).values(
        linePayload.map((l) => ({
          saleId: sale.id,
          productId: l.productId,
          sku: l.sku,
          productName: l.productName,
          categoryName: l.categoryName,
          brand: l.brand,
          quantity: l.quantity,
          unitPrice: l.unitPrice,
          unitCost: l.unitCost,
          lineTotal: l.lineTotal,
        })),
      );

      for (const line of normalized) {
        const updated = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${line.quantity}` })
          .where(
            and(
              eq(products.id, line.productId),
              sql`${products.stock} >= ${line.quantity}`,
            ),
          )
          .returning({ id: products.id });
        if (updated.length === 0) {
          throw new Error("Stock changed while checking out. Please try again.");
        }
      }

      return sale.id;
    });

    return { ok: true, saleId };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Checkout failed.";
    return { ok: false, error: message };
  }
}
