import Image from "next/image";
import { AdminShell } from "@/components/admin-shell";
import { adminDeleteProduct, adminSaveProduct } from "@/lib/actions";
import { getAdminProducts } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function AdminProductsPage() {
  const [products, categories, sellers] = await Promise.all([
    getAdminProducts(),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.sellerProfile.findMany({ orderBy: { storeName: "asc" } })
  ]);

  return (
    <AdminShell title="Product CRUD">
      <section className="card p-6">
        <h2 className="text-2xl font-black">Create product</h2>
        <form action={adminSaveProduct} className="mt-5 grid gap-3 md:grid-cols-3">
          <input className="input" name="name" placeholder="Name" required />
          <input className="input" name="slug" placeholder="Slug (optional)" />
          <input className="input" name="brand" placeholder="Brand" required />
          <select className="input" name="categoryId" required>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select className="input" name="sellerId" required>
            {sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.storeName}</option>)}
          </select>
          <input className="input" name="price" type="number" step="0.01" placeholder="Price" required />
          <input className="input" name="compareAtPrice" type="number" step="0.01" placeholder="Compare at price" />
          <input className="input" name="quantity" type="number" placeholder="Quantity" defaultValue="10" />
          <input className="input" name="lowStockAt" type="number" placeholder="Low-stock threshold" defaultValue="5" />
          <input className="input" name="sku" placeholder="SKU" />
          <input className="input" name="warehouse" placeholder="Warehouse" />
          <input className="input" name="imageUrl" placeholder="Image URL or /uploads/file" />
          <textarea className="input min-h-28 md:col-span-3" name="description" placeholder="Description" required />
          <label className="flex items-center gap-2 text-sm font-bold"><input name="isActive" type="checkbox" defaultChecked /> Active</label>
          <label className="flex items-center gap-2 text-sm font-bold"><input name="isFeatured" type="checkbox" /> Featured</label>
          <input className="input" name="popularity" type="number" placeholder="Popularity" defaultValue="0" />
          <button className="btn-primary md:col-span-3" type="submit">Create product</button>
        </form>
      </section>

      <section className="card mt-6 p-6">
        <h2 className="text-2xl font-black">Products</h2>
        <div className="table-wrap mt-4">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-3">Product</th>
                <th>Category</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-slate-100 align-top">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-100">
                        <Image src={product.images[0]?.url ?? "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-black">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td>{product.category.name}</td>
                  <td>{product.seller.storeName}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.inventory?.quantity ?? 0}</td>
                  <td>{product.isActive ? "Active" : "Hidden"}</td>
                  <td>
                    <form action={adminDeleteProduct}>
                      <input type="hidden" name="id" value={product.id} />
                      <button className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700" type="submit">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
}
