import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const deals = await prisma.product.findMany({
    where: { isActive: true, compareAtPrice: { not: null } },
    include: {
      category: true,
      seller: true,
      images: { orderBy: { position: "asc" } },
      inventory: true,
      reviews: {
        where: { status: "APPROVED" },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 5
      }
    },
    orderBy: { popularity: "desc" }
  });

  return (
    <section className="container-page py-8">
      <div className="card bg-rose-50 p-8">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-rose-600">Deals</p>
        <h1 className="mt-2 text-3xl font-black md:text-5xl">Limited-time marketplace offers</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Original promotions from sample sellers. Configure coupons and product deal windows in the admin panel.
        </p>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {deals.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
