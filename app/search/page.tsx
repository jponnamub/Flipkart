import Link from "next/link";
import { Search } from "lucide-react";
import { getProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const query = params.q ?? "";
  const products = await getProducts({ query, sort: params.sort });

  return (
    <section className="container-page py-8">
      <div className="card p-6">
        <form className="flex flex-col gap-3 md:flex-row" action="/search">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input className="input pl-11" name="q" defaultValue={query} placeholder="Search the marketplace" />
          </div>
          <button className="btn-primary" type="submit">
            Search
          </button>
        </form>
      </div>
      <div className="mt-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">Search results</p>
          <h1 className="mt-2 text-3xl font-black">{query ? `Results for "${query}"` : "Search products"}</h1>
        </div>
        <Link className="text-sm font-bold text-blue-700" href="/products">
          Advanced filters
        </Link>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
