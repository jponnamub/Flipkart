import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Heart, ShoppingCart, Store } from "lucide-react";
import { getProductBySlug, getRecommendations } from "@/lib/catalog";
import { addToCart, createReview, toggleWishlist } from "@/lib/actions";
import { formatCurrency, percentOff } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";
import { RatingStars } from "@/components/rating-stars";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const recommendations = await getRecommendations(product.id, product.categoryId);
  const image = product.images[0]?.url ?? "/placeholder.svg";
  const discount = percentOff(product.price.toString(), product.compareAtPrice?.toString());

  return (
    <section className="container-page py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="card overflow-hidden">
          <div className="relative aspect-square bg-slate-100">
            {discount ? (
              <span className="absolute left-5 top-5 z-10 rounded-full bg-rose-600 px-4 py-2 text-sm font-black text-white">
                {discount}% off
              </span>
            ) : null}
            <Image src={image} alt={product.name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700" href={`/categories/${product.category.slug}`}>
              {product.category.name}
            </Link>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold text-slate-600">{product.brand}</span>
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">{product.name}</h1>
          <div className="mt-4">
            <RatingStars rating={product.rating} count={product.reviewCount} />
          </div>
          <p className="mt-5 text-lg text-slate-600">{product.description}</p>
          <div className="mt-6 flex flex-wrap items-end gap-3">
            <span className="text-4xl font-black">{formatCurrency(product.price)}</span>
            {product.compareAtPrice ? (
              <span className="pb-1 text-lg text-slate-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
            ) : null}
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold">
              {product.inventory && product.inventory.quantity > 0
                ? `${product.inventory.quantity} in stock`
                : "Currently out of stock"}
            </p>
            <p className="mt-1 text-sm text-slate-500">SKU: {product.inventory?.sku ?? "Not assigned"}</p>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <form action={addToCart.bind(null, product.id)} className="flex-1">
              <button className="btn-primary w-full" type="submit">
                <ShoppingCart size={18} /> Add to cart
              </button>
            </form>
            <form action={toggleWishlist.bind(null, product.id)}>
              <button className="btn-secondary w-full sm:w-auto" type="submit">
                <Heart size={18} /> Wishlist
              </button>
            </form>
          </div>
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
            <Store className="text-blue-600" />
            <div>
              <p className="font-black">{product.seller.storeName}</p>
              <p className="text-sm text-slate-500">Seller rating {product.seller.rating.toFixed(1)} / 5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card p-6">
          <h2 className="text-2xl font-black">Customer reviews</h2>
          <div className="mt-5 grid gap-4">
            {product.reviews.map((review) => (
              <article key={review.id} className="rounded-2xl border border-slate-200 p-4">
                <RatingStars rating={review.rating} />
                <h3 className="mt-2 font-black">{review.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{review.comment}</p>
                <p className="mt-3 text-xs font-semibold text-slate-400">By {review.user.name ?? "Customer"}</p>
              </article>
            ))}
            {product.reviews.length === 0 ? <p className="text-slate-500">No approved reviews yet.</p> : null}
          </div>
        </section>
        <aside className="card p-6">
          <h2 className="text-2xl font-black">Write a review</h2>
          <p className="mt-2 text-sm text-slate-500">Reviews are queued for admin moderation before publication.</p>
          <form action={createReview} className="mt-5 grid gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <input type="hidden" name="slug" value={product.slug} />
            <label className="grid gap-1 text-sm font-semibold">
              Rating
              <select className="input" name="rating" defaultValue="5">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} stars
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Title
              <input className="input" name="title" required />
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Comment
              <textarea className="input min-h-28" name="comment" required />
            </label>
            <button className="btn-primary" type="submit">
              Submit review
            </button>
          </form>
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="text-3xl font-black">Recommended products</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {recommendations.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>
    </section>
  );
}
