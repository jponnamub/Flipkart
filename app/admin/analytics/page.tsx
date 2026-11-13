import { AdminShell } from "@/components/admin-shell";
import { RevenueChart } from "@/components/revenue-chart";
import { getAdminDashboardData } from "@/lib/admin";
import { formatCurrency } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const data = await getAdminDashboardData();

  return (
    <AdminShell title="Sales analytics">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card p-6">
          <h2 className="text-2xl font-black">Revenue over time</h2>
          <RevenueChart data={data.revenueChart} />
        </section>
        <aside className="grid gap-4">
          <div className="card p-5">
            <p className="text-sm font-bold text-slate-500">Lifetime revenue</p>
            <p className="mt-1 text-3xl font-black">{formatCurrency(data.revenue)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm font-bold text-slate-500">Current month revenue</p>
            <p className="mt-1 text-3xl font-black">{formatCurrency(data.monthRevenue)}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm font-bold text-slate-500">Pending reviews</p>
            <p className="mt-1 text-3xl font-black">{data.pendingReviews}</p>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}
