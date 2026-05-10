/**
 * Seed Neon Postgres with demo categories, products, customers, and historical sales.
 * Run: bun run db:seed
 */
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { eq, sql } from "drizzle-orm";
import { db } from "../src/db";
import {
  categories,
  customers,
  products,
  saleItems,
  sales,
  users,
} from "../src/db/schema";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function saleNumberFor(d: Date) {
  const y = d.getUTCFullYear();
  const m = pad2(d.getUTCMonth() + 1);
  const day = pad2(d.getUTCDate());
  return `S-${y}${m}${day}-${randomUUID().replaceAll("-", "").slice(0, 10)}`;
}

function randomSaleDate(now: Date): Date {
  const msPerDay = 86400000;
  const start = now.getTime() - 60 * msPerDay;
  const weights: number[] = [];
  for (let i = 0; i < 60; i++) {
    const day = new Date(start + i * msPerDay);
    const w = day.getUTCDay();
    const weekend = w === 0 || w === 6;
    weights.push((0.85 + Math.random() * 0.35) * (weekend ? 1.4 : 1));
  }
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  let idx = 0;
  for (let i = 0; i < 60; i++) {
    r -= weights[i]!;
    if (r <= 0) {
      idx = i;
      break;
    }
  }
  const dayStart = start + idx * msPerDay;
  const t = dayStart + Math.random() * (msPerDay * 0.999);
  return new Date(t);
}

const CATEGORY_SEED = [
  { name: "Cables & adapters", slug: "cables" },
  { name: "Charging", slug: "charging" },
  { name: "Peripherals", slug: "peripherals" },
  { name: "Mobile accessories", slug: "mobile" },
] as const;

const PRODUCT_SEED: {
  sku: string;
  name: string;
  slug: string;
  categorySlug: string;
  brand: string;
  description: string;
  price: string;
  cost: string;
  imageUrl: string;
}[] = [
  {
    sku: "CBL-USBC-2M",
    name: "USB-C cable 2m",
    slug: "usb-c-cable-2m",
    categorySlug: "cables",
    brand: "CableWorks",
    description: "Braided USB-C to USB-C cable, 60W charging, 2 meter length.",
    price: "14.99",
    cost: "6.50",
    imageUrl: "/products/usb-c-cable-2m.png",
  },
  {
    sku: "ADP-USBC-HDMI",
    name: "USB-C to HDMI adapter",
    slug: "usb-c-hdmi-adapter",
    categorySlug: "cables",
    brand: "CableWorks",
    description: "Compact adapter for external monitors up to 4K30.",
    price: "24.99",
    cost: "11.00",
    imageUrl: "/products/usb-c-hdmi-adapter.png",
  },
  {
    sku: "CBL-LTG-1M",
    name: "Lightning cable 1m",
    slug: "lightning-cable-1m",
    categorySlug: "cables",
    brand: "BrightLink",
    description: "MFi-certified Lightning to USB-A cable, 1 meter.",
    price: "18.99",
    cost: "8.20",
    imageUrl: "/products/lightning-cable-1m.png",
  },
  {
    sku: "PWR-PB-20K",
    name: "Power bank 20000mAh",
    slug: "power-bank-20000",
    categorySlug: "charging",
    brand: "VoltRidge",
    description: "High-capacity portable battery with USB-C PD 22.5W output.",
    price: "45.99",
    cost: "22.00",
    imageUrl: "/products/power-bank-20000.png",
  },
  {
    sku: "CHG-WL-PAD",
    name: "Wireless charging pad",
    slug: "wireless-charging-pad",
    categorySlug: "charging",
    brand: "VoltRidge",
    description: "Qi wireless pad with silicone anti-slip ring.",
    price: "22.50",
    cost: "9.80",
    imageUrl: "/products/wireless-charging-pad.png",
  },
  {
    sku: "CHG-GAN-65W",
    name: "65W GaN wall charger",
    slug: "gan-charger-65w",
    categorySlug: "charging",
    brand: "VoltRidge",
    description: "Foldable prongs, dual USB-C ports, fast charge laptops and phones.",
    price: "39.99",
    cost: "17.50",
    imageUrl: "/products/gan-charger-65w.png",
  },
  {
    sku: "PER-MS-ERGO",
    name: "Wireless ergonomic mouse",
    slug: "wireless-mouse-ergo",
    categorySlug: "peripherals",
    brand: "DeskNest",
    description: "Silent clicks, adjustable DPI, USB receiver stored in battery door.",
    price: "32.99",
    cost: "14.25",
    imageUrl: "/products/wireless-mouse-ergo.png",
  },
  {
    sku: "PER-KB-RGB",
    name: "Mechanical keyboard RGB",
    slug: "mechanical-keyboard-rgb",
    categorySlug: "peripherals",
    brand: "DeskNest",
    description: "Hot-swappable switches, per-key RGB, compact TKL layout.",
    price: "89.99",
    cost: "48.00",
    imageUrl: "/products/mechanical-keyboard-rgb.png",
  },
  {
    sku: "PER-STAND-AL",
    name: "Aluminum laptop stand",
    slug: "laptop-stand-aluminum",
    categorySlug: "peripherals",
    brand: "DeskNest",
    description: "Raises screen to eye level, ventilated panel for airflow.",
    price: "49.50",
    cost: "21.00",
    imageUrl: "/products/laptop-stand-aluminum.png",
  },
  {
    sku: "MOB-CASE-CLR",
    name: "Clear MagSafe phone case",
    slug: "phone-case-clear-magsafe",
    categorySlug: "mobile",
    brand: "PocketShell",
    description: "Yellowing-resistant TPU bumper with magnetic ring alignment.",
    price: "27.99",
    cost: "10.50",
    imageUrl: "/products/phone-case-clear-magsafe.png",
  },
  {
    sku: "MOB-BTE-SPT",
    name: "Bluetooth sport earbuds",
    slug: "bluetooth-earbuds-sport",
    categorySlug: "mobile",
    brand: "PocketShell",
    description: "IPX4 sweat resistance, 8h playback, charging case included.",
    price: "54.99",
    cost: "26.00",
    imageUrl: "/products/bluetooth-earbuds-sport.png",
  },
  {
    sku: "CBL-HUB-4",
    name: "USB-C hub 4-port",
    slug: "usb-hub-4-port",
    categorySlug: "mobile",
    brand: "CableWorks",
    description: "USB-C to 4x USB-A 3.0 hub, bus powered.",
    price: "19.99",
    cost: "8.75",
    imageUrl: "/products/usb-hub-4-port.png",
  },
];

const LOCATIONS = [
  { city: "Seattle", district: "Capitol Hill" },
  { city: "Seattle", district: "Ballard" },
  { city: "Portland", district: "Pearl District" },
  { city: "Portland", district: "Alberta Arts" },
  { city: "Austin", district: "South Congress" },
  { city: "Austin", district: "Hyde Park" },
  { city: "Denver", district: "LoHi" },
  { city: "Denver", district: "RiNo" },
] as const;

const FIRST_NAMES = [
  "Alex",
  "Jordan",
  "Taylor",
  "Casey",
  "Riley",
  "Morgan",
  "Quinn",
  "Avery",
  "Skyler",
  "Reese",
  "Jamie",
  "Cameron",
  "Drew",
  "Blake",
  "Emerson",
  "Finley",
  "Harper",
  "Logan",
  "Parker",
  "Rowan",
];

async function main() {
  console.log("Truncating tables…");
  await db.execute(
    sql.raw(
      "TRUNCATE TABLE sale_items, sales, products, customers, users, categories RESTART IDENTITY CASCADE",
    ),
  );

  console.log("Inserting categories…");
  await db.insert(categories).values([...CATEGORY_SEED]);

  const catRows = await db.select().from(categories);
  const catIdBySlug = new Map(catRows.map((c) => [c.slug, c.id]));

  const passwordHash = await bcrypt.hash("password123", 10);

  console.log("Inserting users & customers…");
  for (let i = 0; i < 20; i++) {
    const n = pad2(i + 1);
    const loc = LOCATIONS[i % LOCATIONS.length]!;
    const [u] = await db
      .insert(users)
      .values({
        email: `demo${n}@example.com`,
        passwordHash,
        role: "customer",
      })
      .returning({ id: users.id });

    const genders = ["female", "male", "other"] as const;
    const gender = genders[i % 3]!;
    const birthYear = 1978 + (i % 28);
    const birthMonth = pad2((i % 12) + 1);
    const birthDay = pad2((i % 27) + 1);

    await db.insert(customers).values({
      userId: u!.id,
      fullName: `${FIRST_NAMES[i]} Demo`,
      phone: `+1-206-555-${1000 + i}`,
      gender,
      birthDate: `${birthYear}-${birthMonth}-${birthDay}`,
      city: loc.city,
      district: loc.district,
    });
  }

  const customerRows = await db.select().from(customers);
  const productIds = Array.from({ length: 12 }, (_, i) => i + 1);

  type PlannedLine = { productId: number; quantity: number; unitPrice: string; unitCost: string };
  type PlannedSale = {
    customerId: number;
    saleDate: Date;
    city: string;
    district: string;
    lines: PlannedLine[];
  };

  const planned: PlannedSale[] = [];
  const demand = new Map<number, number>();

  const now = new Date();

  for (let s = 0; s < 80; s++) {
    const cust = customerRows[Math.floor(Math.random() * customerRows.length)]!;
    const lineCount = 1 + Math.floor(Math.random() * 4);
    const picks = new Set<number>();
    while (picks.size < lineCount) {
      picks.add(productIds[Math.floor(Math.random() * productIds.length)]!);
    }
    const lines: PlannedLine[] = [];
    for (const pid of picks) {
      const qty = 1 + Math.floor(Math.random() * 3);
      const meta = PRODUCT_SEED[pid - 1]!;
      lines.push({
        productId: pid,
        quantity: qty,
        unitPrice: meta.price,
        unitCost: meta.cost,
      });
      demand.set(pid, (demand.get(pid) ?? 0) + qty);
    }
    planned.push({
      customerId: cust.id,
      saleDate: randomSaleDate(now),
      city: cust.city,
      district: cust.district,
      lines,
    });
  }

  let totalLines = planned.reduce((a, s) => a + s.lines.length, 0);
  while (totalLines < 160) {
    const s = planned[Math.floor(Math.random() * planned.length)]!;
    const pid = productIds[Math.floor(Math.random() * productIds.length)]!;
    if (s.lines.some((l) => l.productId === pid)) continue;
    const qty = 1 + Math.floor(Math.random() * 3);
    const meta = PRODUCT_SEED[pid - 1]!;
    s.lines.push({
      productId: pid,
      quantity: qty,
      unitPrice: meta.price,
      unitCost: meta.cost,
    });
    demand.set(pid, (demand.get(pid) ?? 0) + qty);
    totalLines++;
  }

  console.log("Inserting products (stock reflects seeded demand)…");
  for (const p of PRODUCT_SEED) {
    const cid = catIdBySlug.get(p.categorySlug);
    if (!cid) throw new Error(`Missing category ${p.categorySlug}`);
    const pid = PRODUCT_SEED.indexOf(p) + 1;
    const sold = demand.get(pid) ?? 0;
    const starting = 500 + sold;
    await db.insert(products).values({
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      categoryId: cid,
      brand: p.brand,
      description: p.description,
      price: p.price,
      cost: p.cost,
      stock: starting,
      imageUrl: p.imageUrl,
      isActive: true,
    });
  }

  for (const [pid, qty] of demand) {
    await db
      .update(products)
      .set({ stock: sql`${products.stock} - ${qty}` })
      .where(eq(products.id, pid));
  }

  const catNameById = new Map(catRows.map((c) => [c.id, c.name]));

  console.log("Inserting sales & sale_items…");
  for (const sale of planned) {
    let subtotal = 0;
    const itemRows: (typeof saleItems.$inferInsert)[] = [];
    for (const line of sale.lines) {
      const unit = Number.parseFloat(line.unitPrice);
      const lineTotal = unit * line.quantity;
      subtotal += lineTotal;
      const pMeta = PRODUCT_SEED[line.productId - 1]!;
      const cid = catIdBySlug.get(pMeta.categorySlug)!;
      const categoryName = catNameById.get(cid) ?? "Unknown";
      itemRows.push({
        saleId: 0,
        productId: line.productId,
        sku: pMeta.sku,
        productName: pMeta.name,
        categoryName,
        brand: pMeta.brand,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        unitCost: line.unitCost,
        lineTotal: (Math.round(lineTotal * 100) / 100).toFixed(2),
      });
    }
    const subStr = (Math.round(subtotal * 100) / 100).toFixed(2);

    const [saleRow] = await db
      .insert(sales)
      .values({
        saleNumber: saleNumberFor(sale.saleDate),
        customerId: sale.customerId,
        saleDate: sale.saleDate,
        subtotal: subStr,
        totalAmount: subStr,
        city: sale.city,
        district: sale.district,
      })
      .returning({ id: sales.id });

    const sid = saleRow!.id;
    await db.insert(saleItems).values(
      itemRows.map((r) => ({
        ...r,
        saleId: sid,
      })),
    );
  }

  const [{ c: saleCount }] = await db.select({ c: sql<number>`count(*)::int` }).from(sales);
  const [{ c: itemCount }] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(saleItems);

  console.log(`Done. Sales: ${saleCount}, sale_items: ${itemCount}`);
  console.log("Demo logins: demo01@example.com … demo20@example.com / password123");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
