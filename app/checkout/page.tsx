import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveAddress } from "@/lib/actions";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/checkout");

  const [items, addresses] = await Promise.all([
    prisma.cartItem.findMany({
      where: { userId: session.user.id },
      include: { product: { include: { images: true } } }
    }),
    prisma.address.findMany({ where: { userId: session.user.id }, orderBy: { isDefault: "desc" } })
  ]);

  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const shipping = subtotal > 75 ? 0 : 8;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <section className="container-page py-8">
      <h1 className="text-4xl font-black">Checkout</h1>
      {params.error ? (
        <div className="mt-5 rounded-2xl bg-rose-50 p-4 font-semibold text-rose-700">
          Stripe test checkout is not configured. Add a sk_test key to STRIPE_SECRET_KEY and retry.
        </div>
      ) : null}
      {params.checkout === "cancelled" ? (
        <div className="mt-5 rounded-2xl bg-amber-50 p-4 font-semibold text-amber-800">
          Checkout was cancelled. Your cart is still saved.
        </div>
      ) : null}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <section className="card p-6">
            <h2 className="text-2xl font-black">Shipping address</h2>
            <div className="mt-4 grid gap-3">
              {addresses.map((address) => (
                <div key={address.id} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-black">{address.label}</p>
                  <p className="text-sm text-slate-500">
                    {address.line1}, {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>
              ))}
            </div>
            <form action={saveAddress} className="mt-5 grid gap-3 md:grid-cols-2">
              <input className="input" name="label" placeholder="Label" defaultValue="Home" />
              <input className="input" name="line1" placeholder="Address line 1" required />
              <input className="input" name="line2" placeholder="Address line 2" />
              <input className="input" name="city" placeholder="City" required />
              <input className="input" name="state" placeholder="State" required />
              <input className="input" name="postalCode" placeholder="Postal code" required />
              <input className="input" name="country" placeholder="Country" defaultValue="US" />
              <button className="btn-secondary" type="submit">
                Save address
              </button>
            </form>
          </section>
          <section className="card p-6">
            <h2 className="text-2xl font-black">Items</h2>
            <div className="mt-4 grid gap-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                    <Image src={item.product.images[0]?.url ?? "/placeholder.svg"} alt={item.product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black">{item.product.name}</p>
                    <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <strong>{formatCurrency(Number(item.product.price) * item.quantity)}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="card h-fit p-6">
          <h2 className="text-2xl font-black">Payment</h2>
          <p className="mt-2 text-sm text-slate-500">
            Payments are processed only through Stripe test mode. Use test cards from Stripe documentation.
          </p>
          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div className="flex justify-between"><span>Shipping</span><strong>{shipping === 0 ? "Free" : formatCurrency(shipping)}</strong></div>
            <div className="flex justify-between"><span>Tax</span><strong>{formatCurrency(tax)}</strong></div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
          <form action="/api/checkout" method="post" className="mt-6">
            <button className="btn-primary w-full" type="submit" disabled={items.length === 0}>
              Continue to Stripe
            </button>
          </form>
        </aside>
      </div>
    </section>
  );
}
