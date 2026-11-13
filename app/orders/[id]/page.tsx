import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { CheckCircle2, Circle } from "lucide-react";
import { OrderStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const timeline: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.PAID,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.DELIVERED
];

export default async function OrderDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: true, address: true, payments: true }
  });

  if (!order) notFound();
  const statusIndex = timeline.indexOf(order.status);

  return (
    <section className="container-page py-8">
      <div className="card p-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">Order details</p>
        <h1 className="mt-2 text-3xl font-black">{order.orderNumber}</h1>
        <p className="mt-2 text-slate-500">Placed {order.createdAt.toLocaleString()}</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <section className="card p-6">
            <h2 className="text-2xl font-black">Tracking</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-5">
              {timeline.map((status, index) => {
                const complete = statusIndex >= index;
                return (
                  <div key={status} className="flex items-center gap-2 rounded-2xl border border-slate-200 p-3">
                    {complete ? <CheckCircle2 className="text-emerald-600" /> : <Circle className="text-slate-300" />}
                    <span className="text-sm font-black">{status}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Tracking number: <strong>{order.trackingNumber ?? "Pending fulfillment"}</strong>
            </p>
          </section>
          <section className="card p-6">
            <h2 className="text-2xl font-black">Items</h2>
            <div className="mt-4 grid gap-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-slate-100">
                    <Image src={item.image ?? "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black">{item.name}</p>
                    <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <strong>{formatCurrency(Number(item.price) * item.quantity)}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="card h-fit p-6">
          <h2 className="text-2xl font-black">Summary</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><strong>{formatCurrency(order.subtotal)}</strong></div>
            <div className="flex justify-between"><span>Discount</span><strong>-{formatCurrency(order.discountTotal)}</strong></div>
            <div className="flex justify-between"><span>Shipping</span><strong>{formatCurrency(order.shippingTotal)}</strong></div>
            <div className="flex justify-between"><span>Tax</span><strong>{formatCurrency(order.taxTotal)}</strong></div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-black"><span>Total</span><span>{formatCurrency(order.total)}</span></div>
          </div>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="font-black">Ship to</p>
            <p className="mt-1 text-sm text-slate-500">
              {order.address
                ? `${order.address.line1}, ${order.address.city}, ${order.address.state} ${order.address.postalCode}`
                : "No address saved"}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
