import { getBrands, getCategories, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [products, categories, brands] = await Promise.all([
    getProducts({
      query: params.q,
      category: params.category,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      rating: params.rating,
      brand: params.brand,
      sort: params.sort
    }),
    getCategories(),
    getBrands()
  ]);

  return (
    <section className="container-page py-8">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">Catalog</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">All products</h1>
        <p className="mt-3 text-slate-500">{products.length} products match your filters.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ProductFilters categories={categories} brands={brands} defaults={params} />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {products.length === 0 ? (
            <div className="card col-span-full p-10 text-center">
              <h2 className="text-xl font-black">No products found</h2>
              <p className="mt-2 text-slate-500">Try changing your filters or search terms.</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
