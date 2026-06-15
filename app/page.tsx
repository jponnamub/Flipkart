import Link from "next/link";
import { ArrowRight, BadgePercent, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getHomeData } from "@/lib/catalog";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { categories, featured, deals, newest } = await getHomeData();
  const assurances: { icon: LucideIcon; title: string; text: string }[] = [
    { icon: Truck, title: "Fast fulfillment", text: "Shipping-ready orders with status tracking." },
    { icon: ShieldCheck, title: "Secure checkout", text: "Stripe test-mode checkout and signed webhooks." },
    { icon: PackageCheck, title: "Inventory aware", text: "Low-stock alerts and quantity updates." },
    { icon: BadgePercent, title: "Promotions", text: "Coupons and deal merchandising built in." }
  ];

  return (
    <div>
      <section className="container-page grid gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div className="card overflow-hidden bg-slate-950 p-8 text-white md:p-12">
          <p className="text-sm font-black uppercase tracking-[0.3em] text-blue-300">Original marketplace demo</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            Shop curated essentials from independent sellers.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Browse products, compare deals, save favorites, checkout with Stripe test mode, and track orders from a clean responsive storefront.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              Start shopping <ArrowRight size={18} />
            </Link>
            <Link href="/deals" className="btn-secondary bg-white/10 text-white">
              View deals
            </Link>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {assurances.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-5">
              <Icon className="text-blue-600" />
              <h2 className="mt-3 font-black">{title}</h2>
              <p className="mt-1 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-blue-600">Categories</p>
            <h2 className="mt-2 text-3xl font-black">Shop by department</h2>
          </div>
          <Link href="/products" className="text-sm font-bold text-blue-700">
            View all
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`} className="card p-5 hover:border-blue-300">
              <p className="text-xl font-black">{category.name}</p>
              <p className="mt-2 text-sm text-slate-500">{category.description}</p>
              <p className="mt-4 text-sm font-bold text-blue-700">{category._count.products} products</p>
            </Link>
          ))}
        </div>
      </section>

      <ProductSection title="Featured picks" href="/products" products={featured} />
      <ProductSection title="Deals ending soon" href="/deals" products={deals} />
      <ProductSection title="Newest arrivals" href="/products?sort=newest" products={newest} />
    </div>
  );
}

function ProductSection({
  title,
  href,
  products
}: {
  title: string;
  href: string;
  products: Awaited<ReturnType<typeof getHomeData>>["featured"];
}) {
  return (
    <section className="container-page py-8">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-3xl font-black">{title}</h2>
        <Link href={href} className="text-sm font-bold text-blue-700">
          View more
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
