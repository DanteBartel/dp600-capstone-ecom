import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/src/db";
import { sales } from "@/src/db/schema";
import { getCurrentUser } from "@/src/lib/auth";
import { money, num } from "@/src/lib/money";

export default async function PurchasesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/purchases");

  const rows = await db
    .select({
      id: sales.id,
      saleNumber: sales.saleNumber,
      saleDate: sales.saleDate,
      totalAmount: sales.totalAmount,
      city: sales.city,
      district: sales.district,
    })
    .from(sales)
    .where(eq(sales.customerId, user.customerId))
    .orderBy(desc(sales.saleDate));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your purchases</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Each row is one completed checkout from this shop.
        </p>
      </div>

      {!rows.length ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          No purchases yet.{" "}
          <Link href="/products" className="font-medium text-sky-700 underline dark:text-sky-400">
            Start shopping
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {rows.map((s) => (
            <li key={s.id}>
              <Link
                href={`/purchases/${s.id}`}
                className="flex flex-col gap-1 p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/80 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {s.saleNumber}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {new Date(s.saleDate).toLocaleString()} · {s.city},{" "}
                    {s.district}
                  </p>
                </div>
                <p className="text-lg font-bold text-sky-700 dark:text-sky-400">
                  {money(num(s.totalAmount))}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
