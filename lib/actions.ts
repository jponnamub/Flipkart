"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import {
  DiscountType,
  OrderStatus,
  PaymentStatus,
  Prisma,
  ReviewStatus,
  Role
} from "@prisma/client";
import { authOptions, canAccessAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { orderNumber, slugify } from "@/lib/utils";

async function requireUser(role?: Role) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");
  if (role && session.user.role !== role) redirect("/");
  return session.user;
}

async function requireAdmin() {
  const user = await requireUser();
  if (!canAccessAdmin(user.role)) redirect("/");
  return user;
}

async function refreshProductRating(productId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { productId, status: ReviewStatus.APPROVED },
    _avg: { rating: true },
    _count: { rating: true }
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count.rating
    }
  });
}

export async function registerUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || password.length < 8) {
    redirect("/register?error=invalid");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) redirect("/register?error=exists");

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: Role.CUSTOMER
    }
  });

  redirect("/login?registered=1");
}

export async function updateProfile(formData: FormData) {
  const user = await requireUser();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || null
    }
  });
  revalidatePath("/profile");
}

export async function saveAddress(formData: FormData) {
  const user = await requireUser();
  const data = {
    label: String(formData.get("label") ?? "Home"),
    line1: String(formData.get("line1") ?? ""),
    line2: String(formData.get("line2") ?? "") || null,
    city: String(formData.get("city") ?? ""),
    state: String(formData.get("state") ?? ""),
    postalCode: String(formData.get("postalCode") ?? ""),
    country: String(formData.get("country") ?? "US")
  };

  await prisma.address.create({
    data: {
      ...data,
      userId: user.id,
      isDefault: true
    }
  });
  revalidatePath("/profile");
  revalidatePath("/checkout");
}

export async function addToCart(productId: string) {
  const user = await requireUser();
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: { quantity: { increment: 1 } },
    create: { userId: user.id, productId, quantity: 1 }
  });
  revalidatePath("/cart");
}

export async function updateCartItem(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const quantity = Number(formData.get("quantity"));

  const item = await prisma.cartItem.findFirst({ where: { id, userId: user.id } });
  if (!item) return;

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id } });
  } else {
    await prisma.cartItem.update({ where: { id }, data: { quantity } });
  }
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function toggleWishlist(productId: string) {
  const user = await requireUser();
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } }
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
  } else {
    await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  }

  revalidatePath("/wishlist");
}

export async function createReview(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId"));
  const rating = Number(formData.get("rating"));

  await prisma.review.create({
    data: {
      userId: user.id,
      productId,
      rating: Math.min(5, Math.max(1, rating)),
      title: String(formData.get("title") ?? "").trim(),
      comment: String(formData.get("comment") ?? "").trim(),
      status: ReviewStatus.PENDING
    }
  });

  revalidatePath(`/products/${String(formData.get("slug") ?? "")}`);
}

export async function adminSaveProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? name));
  const categoryId = String(formData.get("categoryId"));
  const sellerId = String(formData.get("sellerId"));
  const price = String(formData.get("price") ?? "0");
  const compareAtPrice = String(formData.get("compareAtPrice") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  const data: Prisma.ProductCreateInput = {
    name,
    slug,
    description: String(formData.get("description") ?? ""),
    brand: String(formData.get("brand") ?? ""),
    price,
    compareAtPrice: compareAtPrice ? compareAtPrice : null,
    isActive: formData.get("isActive") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    popularity: Number(formData.get("popularity") ?? 0),
    category: { connect: { id: categoryId } },
    seller: { connect: { id: sellerId } },
    images: imageUrl
      ? {
          create: {
            url: imageUrl,
            alt: name,
            position: 0
          }
        }
      : undefined,
    inventory: {
      create: {
        quantity,
        lowStockAt: Number(formData.get("lowStockAt") ?? 5),
        sku: String(formData.get("sku") ?? `SKU-${slug.toUpperCase().slice(0, 24)}`),
        warehouse: String(formData.get("warehouse") ?? "")
      }
    }
  };

  if (id) {
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        brand: data.brand,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        popularity: data.popularity,
        category: data.category,
        seller: data.seller,
        inventory: {
          upsert: {
            update: {
              quantity,
              lowStockAt: Number(formData.get("lowStockAt") ?? 5),
              sku: String(formData.get("sku") ?? `SKU-${slug.toUpperCase().slice(0, 24)}`),
              warehouse: String(formData.get("warehouse") ?? "")
            },
            create: {
              quantity,
              lowStockAt: Number(formData.get("lowStockAt") ?? 5),
              sku: String(formData.get("sku") ?? `SKU-${slug.toUpperCase().slice(0, 24)}`),
              warehouse: String(formData.get("warehouse") ?? "")
            }
          }
        }
      }
    });
  } else {
    await prisma.product.create({ data });
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function adminDeleteProduct(formData: FormData) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/products");
}

export async function adminSaveCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? name));

  const data = {
    name,
    slug,
    description: String(formData.get("description") ?? ""),
    image: String(formData.get("image") ?? "") || null
  };

  if (id) {
    await prisma.category.update({ where: { id }, data });
  } else {
    await prisma.category.create({ data });
  }
  revalidatePath("/admin/categories");
}

export async function adminUpdateInventory(formData: FormData) {
  await requireAdmin();
  await prisma.inventory.update({
    where: { id: String(formData.get("id")) },
    data: {
      quantity: Number(formData.get("quantity")),
      lowStockAt: Number(formData.get("lowStockAt")),
      warehouse: String(formData.get("warehouse") ?? "")
    }
  });
  revalidatePath("/admin/inventory");
}

export async function adminUpdateOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as OrderStatus;
  const paymentStatus = String(formData.get("paymentStatus")) as PaymentStatus;
  const trackingNumber = String(formData.get("trackingNumber") ?? "");

  await prisma.order.update({
    where: { id },
    data: {
      status,
      paymentStatus,
      trackingNumber: trackingNumber || null,
      notifications: {
        create: {
          type: "ORDER_STATUS_READY",
          channel: "email",
          payload: {
            subject: `Order status updated to ${status}`,
            template: "order-status-update",
            status
          }
        }
      }
    }
  });
  revalidatePath("/admin/orders");
}

export async function adminSaveCoupon(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = {
    code: String(formData.get("code") ?? "").trim().toUpperCase(),
    description: String(formData.get("description") ?? ""),
    discountType: String(formData.get("discountType")) as DiscountType,
    amount: String(formData.get("amount") ?? "0"),
    minSpend: String(formData.get("minSpend") ?? "") || null,
    startsAt: new Date(String(formData.get("startsAt"))),
    endsAt: new Date(String(formData.get("endsAt"))),
    maxRedemptions: Number(formData.get("maxRedemptions") ?? 0) || null,
    isActive: formData.get("isActive") === "on"
  };

  if (id) {
    await prisma.coupon.update({ where: { id }, data });
  } else {
    await prisma.coupon.create({ data });
  }
  revalidatePath("/admin/coupons");
}

export async function adminModerateReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as ReviewStatus;
  const review = await prisma.review.update({
    where: { id },
    data: { status }
  });

  await refreshProductRating(review.productId);
  revalidatePath("/admin/reviews");
}

export async function adminCreateSeller(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const storeName = String(formData.get("storeName") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? storeName));

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: Role.SELLER },
    create: {
      email,
      name: storeName,
      role: Role.SELLER,
      passwordHash: await bcrypt.hash("Seller123!", 12)
    }
  });

  await prisma.sellerProfile.upsert({
    where: { userId: user.id },
    update: {
      storeName,
      slug,
      description: String(formData.get("description") ?? ""),
      isActive: formData.get("isActive") === "on"
    },
    create: {
      userId: user.id,
      storeName,
      slug,
      description: String(formData.get("description") ?? ""),
      isActive: formData.get("isActive") === "on"
    }
  });

  revalidatePath("/admin/sellers");
}

export async function createOrderFromCart(userId: string, stripeSessionId?: string) {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: { include: { images: true } } }
  });

  if (cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.product.price) * item.quantity,
    0
  );
  const shippingTotal = subtotal > 75 ? 0 : 8;
  const taxTotal = Number((subtotal * 0.08).toFixed(2));
  const total = Number((subtotal + shippingTotal + taxTotal).toFixed(2));
  const address = await prisma.address.findFirst({
    where: { userId },
    orderBy: [{ isDefault: "desc" }]
  });

  return prisma.order.create({
    data: {
      orderNumber: orderNumber(),
      userId,
      addressId: address?.id,
      subtotal,
      shippingTotal,
      taxTotal,
      total,
      stripeSessionId,
      items: {
        create: cartItems.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          image: item.product.images[0]?.url,
          quantity: item.quantity,
          price: item.product.price
        }))
      },
      payments: {
        create: {
          provider: "stripe",
          providerReference: stripeSessionId,
          status: PaymentStatus.PENDING,
          amount: total
        }
      },
      notifications: {
        create: {
          userId,
          type: "ORDER_CONFIRMATION_READY",
          channel: "email",
          payload: {
            subject: "Order received",
            template: "order-confirmation"
          }
        }
      }
    },
    include: { items: true }
  });
}
