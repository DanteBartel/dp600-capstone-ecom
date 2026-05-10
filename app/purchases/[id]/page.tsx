import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/src/db";
import { saleItems, sales } from "@/src/db/schema";
import { getCurrentUser } from "@/src/lib/auth";
import { money, num } from "@/src/lib/money";

export default async function PurchaseDetailPage({
  params,
  searchParams,
}: {
  params: { id: string } | Promise<{ id: string }>;
  searchParams: { new?: string } | Promise<{ new?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;
  const saleId = Number(id);
  if (!Number.isFinite(saleId)) notFound();

  const saleRows = await db
    .select()
    .from(sales)
    .where(and(eq(sales.id, saleId), eq(sales.customerId, user.customerId)))
    .limit(1);

  const sale = saleRows[0];
  if (!sale) notFound();

  const items = await db
    .select()
    .from(saleItems)
    .where(eq(saleItems.saleId, saleId))
    .orderBy(asc(saleItems.id));

  const isNew = sp.new === "1";

  return (
    <div className="space-y-8">
      {isNew ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
          Purchase confirmed — thank you! Your sale was saved with the line
          items below.
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Purchase detail</h1>
          <p className="mt-1 font-mono text-sm text-zinc-600 dark:text-zinc-400">
            {sale.saleNumber}
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {new Date(sale.saleDate).toLocaleString()}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Ship-to area (profile snapshot): {sale.city}, {sale.district}
          </p>
        </div>
        <Link
          href="/purchases"
          className="text-sm font-medium text-sky-700 hover:underline dark:text-sky-400"
        >
          ← All purchases
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
            <tr>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Brand</th>
              <th className="px-3 py-2 text-right">Qty</th>
              <th className="px-3 py-2 text-right">Unit</th>
              <th className="px-3 py-2 text-right">Line</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {items.map((it) => (
              <tr key={it.id}>
                <td className="px-3 py-2 font-medium">{it.productName}</td>
                <td className="px-3 py-2 font-mono text-xs">{it.sku}</td>
                <td className="px-3 py-2">{it.categoryName}</td>
                <td className="px-3 py-2">{it.brand}</td>
                <td className="px-3 py-2 text-right">{it.quantity}</td>
                <td className="px-3 py-2 text-right">
                  {money(num(it.unitPrice))}
                </td>
                <td className="px-3 py-2 text-right font-semibold">
                  {money(num(it.lineTotal))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="text-right">
          <p className="text-xs text-zinc-500">Subtotal / Total</p>
          <p className="text-xl font-bold">{money(num(sale.totalAmount))}</p>
        </div>
      </div>
    </div>
  );
}
