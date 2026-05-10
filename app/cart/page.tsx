import { asc, eq } from "drizzle-orm";
import { CartView } from "./CartView";
import { db } from "@/src/db";
import { products } from "@/src/db/schema";
import { getCurrentUser } from "@/src/lib/auth";

export default async function CartPage() {
  const user = await getCurrentUser();
  const catalog = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      sku: products.sku,
      price: products.price,
      stock: products.stock,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(eq(products.isActive, true))
    .orderBy(asc(products.id));

  return <CartView catalog={catalog} loggedIn={!!user} />;
}
