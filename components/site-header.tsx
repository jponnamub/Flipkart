import Link from "next/link";
import { getServerSession } from "next-auth";
import { Heart, Menu, Search, ShoppingCart, ShieldCheck, Store, UserRound } from "lucide-react";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/sign-out-button";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const [cartCount, categories] = await Promise.all([
    session?.user
      ? prisma.cartItem
          .aggregate({ where: { userId: session.user.id }, _sum: { quantity: true } })
          .then((result) => result._sum.quantity ?? 0)
      : Promise.resolve(0),
    prisma.category.findMany({ orderBy: { name: "asc" }, take: 6 })
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex items-center gap-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-black tracking-tight text-slate-950">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-600 text-white">
            <Store size={22} />
          </span>
          <span className="hidden text-xl sm:block">Northstar Market</span>
        </Link>

        <form action="/search" className="hidden flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 md:flex">
          <Search className="text-slate-400" size={18} />
          <input
            name="q"
            className="w-full bg-transparent px-3 outline-none"
            placeholder="Search products, brands, and categories"
          />
          <button className="rounded-full bg-slate-950 px-4 py-1.5 text-sm font-bold text-white">
            Search
          </button>
        </form>

        <nav className="ml-auto flex items-center gap-2">
          <Link className="rounded-full p-2 hover:bg-slate-100 md:hidden" href="/search">
            <Search size={20} />
          </Link>
          <Link className="hidden items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold hover:bg-slate-100 sm:flex" href="/wishlist">
            <Heart size={18} /> Wishlist
          </Link>
          <Link className="relative rounded-full p-2 hover:bg-slate-100" href="/cart" aria-label="Cart">
            <ShoppingCart size={21} />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          {session?.user ? (
            <>
              <Link className="hidden items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold hover:bg-slate-100 md:flex" href="/profile">
                <UserRound size={18} /> {session.user.name?.split(" ")[0] ?? "Account"}
              </Link>
              {session.user.role === Role.ADMIN ? (
                <Link className="hidden items-center gap-1 rounded-full px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 md:flex" href="/admin">
                  <ShieldCheck size={18} /> Admin
                </Link>
              ) : null}
              <div className="hidden md:block">
                <SignOutButton />
              </div>
            </>
          ) : (
            <Link className="btn-primary px-4 py-2 text-sm" href="/login">
              Sign in
            </Link>
          )}
          <button className="rounded-full p-2 hover:bg-slate-100 md:hidden" aria-label="Menu">
            <Menu size={21} />
          </button>
        </nav>
      </div>
      <div className="border-t border-slate-100">
        <nav className="container-page flex gap-4 overflow-x-auto py-2 text-sm font-semibold text-slate-600">
          <Link href="/products" className="whitespace-nowrap text-slate-950">
            All products
          </Link>
          <Link href="/deals" className="whitespace-nowrap text-rose-600">
            Deals
          </Link>
          {categories.map((category) => (
            <Link key={category.id} className="whitespace-nowrap hover:text-blue-700" href={`/categories/${category.slug}`}>
              {category.name}
            </Link>
          ))}
          <Link href="/help" className="whitespace-nowrap hover:text-blue-700">
            Help
          </Link>
        </nav>
      </div>
    </header>
  );
}
