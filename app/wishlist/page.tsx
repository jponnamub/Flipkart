import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login?callbackUrl=/wishlist");

  const wishlist = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
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
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <section className="container-page py-8">
      <h1 className="text-4xl font-black">Wishlist</h1>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {wishlist.map((item) => (
          <ProductCard key={item.id} product={item.product} />
        ))}
      </div>
      {wishlist.length === 0 ? (
        <div className="card mt-6 p-10 text-center">
          <h2 className="text-2xl font-black">No saved products yet</h2>
          <p className="mt-2 text-slate-500">Tap the heart on product cards to save favorites.</p>
        </div>
      ) : null}
    </section>
  );
}
