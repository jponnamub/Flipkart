import { AlertTriangle } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { adminUpdateInventory } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function AdminInventoryPage() {
  const inventory = await prisma.inventory.findMany({
    include: { product: true },
    orderBy: { quantity: "asc" }
  });

  return (
    <AdminShell title="Inventory management">
      <section className="card p-6">
        <h2 className="text-2xl font-black">Inventory</h2>
        <div className="mt-4 grid gap-4">
          {inventory.map((item) => {
            const low = item.quantity <= item.lowStockAt;
            return (
              <form key={item.id} action={adminUpdateInventory} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1fr_120px_150px_1fr_auto] md:items-center">
                <input type="hidden" name="id" value={item.id} />
                <div>
                  <p className="font-black">{item.product.name}</p>
                  <p className="text-sm text-slate-500">{item.sku}</p>
                  {low ? <p className="mt-1 flex items-center gap-1 text-sm font-black text-amber-700"><AlertTriangle size={15} /> Low stock</p> : null}
                </div>
                <input className="input" name="quantity" type="number" defaultValue={item.quantity} />
                <input className="input" name="lowStockAt" type="number" defaultValue={item.lowStockAt} />
                <input className="input" name="warehouse" defaultValue={item.warehouse ?? ""} />
                <button className="btn-secondary" type="submit">Update</button>
              </form>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
