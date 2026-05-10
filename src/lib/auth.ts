import { eq } from "drizzle-orm";
import { db } from "@/src/db";
import { customers, users } from "@/src/db/schema";
import { readSessionUserId } from "@/src/lib/session";

export type SessionUser = {
  id: number;
  email: string;
  role: string;
  customerId: number;
  fullName: string;
  city: string;
  district: string;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const userId = await readSessionUserId();
  if (userId == null) return null;

  const rows = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      customerId: customers.id,
      fullName: customers.fullName,
      city: customers.city,
      district: customers.district,
    })
    .from(users)
    .innerJoin(customers, eq(customers.userId, users.id))
    .where(eq(users.id, userId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;
  return row;
}
