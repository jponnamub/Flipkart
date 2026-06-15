import { AdminShell } from "@/components/admin-shell";
import { adminCreateSeller } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function AdminSellersPage() {
  const sellers = await prisma.sellerProfile.findMany({
    include: { user: true, _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminShell title="Seller management">
      <section className="card p-6">
        <h2 className="text-2xl font-black">Create seller</h2>
        <p className="mt-2 text-sm text-slate-500">New sellers receive the local testing password Seller123!.</p>
        <form action={adminCreateSeller} className="mt-5 grid gap-3 md:grid-cols-2">
          <input className="input" name="storeName" placeholder="Store name" required />
          <input className="input" name="email" type="email" placeholder="Seller email" required />
          <input className="input" name="slug" placeholder="Slug (optional)" />
          <label className="flex items-center gap-2 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked /> Active</label>
          <textarea className="input min-h-24 md:col-span-2" name="description" placeholder="Store description" />
          <button className="btn-primary md:col-span-2" type="submit">Save seller</button>
        </form>
      </section>
      <section className="card mt-6 p-6">
        <h2 className="text-2xl font-black">Sellers</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {sellers.map((seller) => (
            <div key={seller.id} className="rounded-2xl border border-slate-200 p-4">
              <p className="text-xl font-black">{seller.storeName}</p>
              <p className="text-sm text-slate-500">{seller.user.email}</p>
              <p className="mt-3 text-sm">{seller.description}</p>
              <div className="mt-4 flex gap-2 text-xs font-black">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">{seller._count.products} products</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">{seller.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
