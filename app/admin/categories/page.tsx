import { AdminShell } from "@/components/admin-shell";
import { adminSaveCategory } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" }
  });

  return (
    <AdminShell title="Category CRUD">
      <section className="card p-6">
        <h2 className="text-2xl font-black">Create category</h2>
        <form action={adminSaveCategory} className="mt-5 grid gap-3 md:grid-cols-2">
          <input className="input" name="name" placeholder="Name" required />
          <input className="input" name="slug" placeholder="Slug (optional)" />
          <input className="input" name="image" placeholder="Image URL" />
          <textarea className="input min-h-24 md:col-span-2" name="description" placeholder="Description" />
          <button className="btn-primary md:col-span-2" type="submit">Create category</button>
        </form>
      </section>
      <section className="card mt-6 p-6">
        <h2 className="text-2xl font-black">Categories</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <form key={category.id} action={adminSaveCategory} className="rounded-2xl border border-slate-200 p-4">
              <input type="hidden" name="id" value={category.id} />
              <div className="grid gap-3">
                <input className="input" name="name" defaultValue={category.name} />
                <input className="input" name="slug" defaultValue={category.slug} />
                <textarea className="input" name="description" defaultValue={category.description ?? ""} />
                <p className="text-sm font-bold text-slate-500">{category._count.products} products</p>
                <button className="btn-secondary" type="submit">Save category</button>
              </div>
            </form>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
