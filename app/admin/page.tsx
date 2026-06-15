import Link from "next/link";
import { AlertTriangle, Boxes, DollarSign, ShoppingBag, Store, Users } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { RevenueChart } from "@/components/revenue-chart";
import { getAdminDashboardData } from "@/lib/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const data = await getAdminDashboardData();
  const stats = [
    { label: "Revenue", value: formatCurrency(data.revenue), icon: DollarSign },
    { label: "This month", value: formatCurrency(data.monthRevenue), icon: ShoppingBag },
    { label: "Users", value: data.users.toLocaleString(), icon: Users },
    { label: "Sellers", value: data.sellers.toLocaleString(), icon: Store },
    { label: "Products", value: data.products.toLocaleString(), icon: Boxes },
    { label: "Orders", value: data.orders.toLocaleString(), icon: ShoppingBag }
  ];

  return (
    <AdminShell title="Dashboard">
      <div className="admin-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <Icon className="text-blue-600" />
            <p className="mt-3 text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card p-6">
          <h2 className="text-2xl font-black">Revenue chart</h2>
          <RevenueChart data={data.revenueChart} />
        </section>
        <aside className="card p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-600" />
            <h2 className="text-2xl font-black">Low-stock alerts</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {data.lowStock.map((item) => (
              <Link key={item.id} href="/admin/inventory" className="rounded-2xl border border-slate-200 p-3">
                <p className="font-black">{item.product.name}</p>
                <p className="text-sm text-slate-500">{item.quantity} left, threshold {item.lowStockAt}</p>
              </Link>
            ))}
            {data.lowStock.length === 0 ? <p className="text-sm text-slate-500">No low-stock products.</p> : null}
          </div>
        </aside>
      </div>
      <section className="card mt-6 p-6">
        <h2 className="text-2xl font-black">Recent orders</h2>
        <div className="table-wrap mt-4">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3">Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-slate-100">
                  <td className="py-3 font-bold">{order.orderNumber}</td>
                  <td>{order.user.email}</td>
                  <td>{order.status}</td>
                  <td>{formatCurrency(order.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
