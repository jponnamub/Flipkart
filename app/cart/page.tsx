import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCartItem } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/cart");

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { images: true, inventory: true } } },
    orderBy: { createdAt: "desc" }
  });

  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);

  return (
    <section className="container-page py-8">
      <h1 className="text-4xl font-black">Cart</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          {items.map((item) => (
            <article key={item.id} className="card grid gap-4 p-4 sm:grid-cols-[120px_1fr]">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100">
                <Image src={item.product.images[0]?.url ?? "/placeholder.svg"} alt={item.product.name} fill className="object-cover" />
              </div>
              <div>
                <Link href={`/products/${item.product.slug}`} className="text-xl font-black">
                  {item.product.name}
                </Link>
                <p className="mt-1 text-sm text-slate-500">{item.product.brand}</p>
                <p className="mt-3 text-lg font-black">{formatCurrency(item.product.price)}</p>
                <form action={updateCartItem} className="mt-4 flex flex-wrap items-center gap-3">
                  <input type="hidden" name="id" value={item.id} />
                  <input className="input w-24" name="quantity" type="number" min="0" max={item.product.inventory?.quantity ?? 99} defaultValue={item.quantity} />
                  <button className="btn-secondary py-2" type="submit">
                    Update
                  </button>
                </form>
              </div>
            </article>
          ))}
          {items.length === 0 ? (
            <div className="card p-10 text-center">
              <h2 className="text-2xl font-black">Your cart is empty</h2>
              <Link href="/products" className="btn-primary mt-5">
                Browse products
              </Link>
            </div>
          ) : null}
        </div>
        <aside className="card h-fit p-6">
          <h2 className="text-2xl font-black">Order summary</h2>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <strong>{formatCurrency(subtotal)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Estimated shipping</span>
              <strong>{subtotal > 75 ? "Free" : formatCurrency(8)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Estimated tax</span>
              <strong>{formatCurrency(subtotal * 0.08)}</strong>
            </div>
            <div className="border-t border-slate-200 pt-3 text-lg font-black">
              <div className="flex justify-between">
                <span>Total</span>
                <span>{formatCurrency(subtotal + (subtotal > 75 || subtotal === 0 ? 0 : 8) + subtotal * 0.08)}</span>
              </div>
            </div>
          </div>
          <Link href="/checkout" className="btn-primary mt-6 w-full">
            Checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
