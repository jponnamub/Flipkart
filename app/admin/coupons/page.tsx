import { DiscountType } from "@prisma/client";
import { AdminShell } from "@/components/admin-shell";
import { adminSaveCoupon } from "@/lib/actions";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  const today = new Date().toISOString().slice(0, 10);
  const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10);

  return (
    <AdminShell title="Coupon and discount management">
      <section className="card p-6">
        <h2 className="text-2xl font-black">Create coupon</h2>
        <form action={adminSaveCoupon} className="mt-5 grid gap-3 md:grid-cols-3">
          <input className="input" name="code" placeholder="Code" required />
          <select className="input" name="discountType" defaultValue={DiscountType.PERCENTAGE}>
            {Object.values(DiscountType).map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <input className="input" name="amount" type="number" step="0.01" placeholder="Amount" required />
          <input className="input" name="minSpend" type="number" step="0.01" placeholder="Minimum spend" />
          <input className="input" name="startsAt" type="date" defaultValue={today} />
          <input className="input" name="endsAt" type="date" defaultValue={future} />
          <input className="input" name="maxRedemptions" type="number" placeholder="Max redemptions" />
          <label className="flex items-center gap-2 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked /> Active</label>
          <input className="input md:col-span-3" name="description" placeholder="Description" />
          <button className="btn-primary md:col-span-3" type="submit">Create coupon</button>
        </form>
      </section>
      <section className="card mt-6 p-6">
        <h2 className="text-2xl font-black">Coupons</h2>
        <div className="table-wrap mt-4">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3">Code</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Window</th>
                <th>Redemptions</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-slate-100">
                  <td className="py-3 font-black">{coupon.code}</td>
                  <td>{coupon.discountType}</td>
                  <td>{coupon.discountType === DiscountType.PERCENTAGE ? `${coupon.amount}%` : formatCurrency(coupon.amount)}</td>
                  <td>{coupon.startsAt.toLocaleDateString()} - {coupon.endsAt.toLocaleDateString()}</td>
                  <td>{coupon.redemptionCount}/{coupon.maxRedemptions ?? "unlimited"}</td>
                  <td>{coupon.isActive ? "Active" : "Inactive"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
