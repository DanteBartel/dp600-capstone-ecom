"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { useCart } from "@/components/CartContext";

const link =
  "text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={`${link} ${active ? "text-sky-700 dark:text-sky-400" : ""}`}
    >
      {children}
    </Link>
  );
}

export function HeaderNav({ userEmail }: { userEmail: string | null }) {
  const { totalQuantity, hydrated } = useCart();

  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          Digit Accessories
        </Link>
        <nav className="flex flex-1 items-center justify-center gap-6 max-sm:hidden">
          <NavLink href="/products">Catalog</NavLink>
          <NavLink href="/cart">Cart</NavLink>
          {userEmail ? <NavLink href="/purchases">Purchases</NavLink> : null}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative rounded-md border border-zinc-200 px-2 py-1 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            Cart
            {hydrated && totalQuantity > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-sky-600 px-1 text-[10px] font-bold text-white">
                {totalQuantity > 99 ? "99+" : totalQuantity}
              </span>
            ) : null}
          </Link>
          {userEmail ? (
            <>
              <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 sm:inline">
                {userEmail}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={`${link} text-xs sm:text-sm`}>
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-4 border-t border-zinc-100 py-2 sm:hidden dark:border-zinc-900">
        <NavLink href="/products">Catalog</NavLink>
        <NavLink href="/cart">Cart</NavLink>
        {userEmail ? <NavLink href="/purchases">Purchases</NavLink> : null}
      </div>
    </header>
  );
}
