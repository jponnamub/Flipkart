import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section className="container-page py-8">
      <h1 className="text-4xl font-black">Orders</h1>
      <div className="mt-6 grid gap-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`} className="card grid gap-4 p-5 hover:border-blue-300 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xl font-black">{order.orderNumber}</p>
              <p className="mt-1 text-sm text-slate-500">
                {order.items.length} items - placed {order.createdAt.toLocaleDateString()}
              </p>
              <span className="mt-3 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                {order.status}
              </span>
            </div>
            <div className="text-left md:text-right">
              <p className="text-2xl font-black">{formatCurrency(order.total)}</p>
              <p className="mt-1 text-sm text-slate-500">{order.paymentStatus}</p>
            </div>
          </Link>
        ))}
        {orders.length === 0 ? (
          <div className="card p-10 text-center">
            <h2 className="text-2xl font-black">No orders yet</h2>
            <Link href="/products" className="btn-primary mt-5">
              Start shopping
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
