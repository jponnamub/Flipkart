import { OrderStatus, PaymentStatus } from "@prisma/client";
import { AdminShell } from "@/components/admin-shell";
import { adminUpdateOrder } from "@/lib/actions";
import { getAdminOrders } from "@/lib/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <AdminShell title="Order management">
      <section className="card p-6">
        <h2 className="text-2xl font-black">Orders, refunds, and status</h2>
        <div className="mt-4 grid gap-4">
          {orders.map((order) => (
            <form key={order.id} action={adminUpdateOrder} className="rounded-2xl border border-slate-200 p-4">
              <input type="hidden" name="id" value={order.id} />
              <div className="grid gap-4 lg:grid-cols-[1fr_160px_160px_200px_auto] lg:items-center">
                <div>
                  <p className="text-lg font-black">{order.orderNumber}</p>
                  <p className="text-sm text-slate-500">{order.user.email} - {order.items.length} items - {formatCurrency(order.total)}</p>
                </div>
                <select className="input" name="status" defaultValue={order.status}>
                  {Object.values(OrderStatus).map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <select className="input" name="paymentStatus" defaultValue={order.paymentStatus}>
                  {Object.values(PaymentStatus).map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <input className="input" name="trackingNumber" defaultValue={order.trackingNumber ?? ""} placeholder="Tracking number" />
                <button className="btn-secondary" type="submit">Save</button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
