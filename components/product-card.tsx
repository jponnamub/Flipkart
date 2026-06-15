import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import type { ProductWithRelations } from "@/lib/catalog";
import { addToCart, toggleWishlist } from "@/lib/actions";
import { formatCurrency, percentOff } from "@/lib/utils";
import { RatingStars } from "@/components/rating-stars";

export function ProductCard({ product }: { product: ProductWithRelations }) {
  const image = product.images[0]?.url ?? "/placeholder.svg";
  const discount = percentOff(product.price.toString(), product.compareAtPrice?.toString());

  return (
    <article className="card group flex h-full flex-col overflow-hidden">
      <Link href={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-slate-100">
        {discount ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-rose-600 px-3 py-1 text-xs font-black text-white">
            {discount}% off
          </span>
        ) : null}
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-600">{product.brand}</p>
        <Link href={`/products/${product.slug}`} className="mt-1 line-clamp-2 text-lg font-black text-slate-950">
          {product.name}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{product.description}</p>
        <div className="mt-3">
          <RatingStars rating={product.rating} count={product.reviewCount} />
        </div>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-xl font-black">{formatCurrency(product.price)}</span>
          {product.compareAtPrice ? (
            <span className="text-sm text-slate-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
          ) : null}
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          {product.inventory && product.inventory.quantity > 0
            ? `${product.inventory.quantity} available`
            : "Out of stock"}
        </p>
        <div className="mt-auto flex gap-2 pt-4">
          <form action={addToCart.bind(null, product.id)} className="flex-1">
            <button className="btn-primary w-full py-2 text-sm" type="submit">
              <ShoppingCart size={16} /> Add
            </button>
          </form>
          <form action={toggleWishlist.bind(null, product.id)}>
            <button className="btn-secondary aspect-square px-3 py-2" type="submit" aria-label="Toggle wishlist">
              <Heart size={17} />
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
