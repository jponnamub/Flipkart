import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getBrands, getCategories, getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();

  const [products, categories, brands] = await Promise.all([
    getProducts({
      ...query,
      category: slug
    }),
    getCategories(),
    getBrands()
  ]);

  return (
    <section className="container-page py-8">
      <div className="mb-6 card p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">Category</p>
        <h1 className="mt-2 text-3xl font-black md:text-5xl">{category.name}</h1>
        <p className="mt-3 max-w-2xl text-slate-500">{category.description}</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <ProductFilters categories={categories} brands={brands} defaults={{ ...query, category: slug }} />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
