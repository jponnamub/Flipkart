import { Prisma, ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    seller: true;
    images: { orderBy: { position: "asc" } };
    inventory: true;
    reviews: {
      where: { status: "APPROVED" };
      include: { user: { select: { name: true; image: true } } };
      orderBy: { createdAt: "desc" };
      take: 5;
    };
  };
}>;

const productInclude = {
  category: true,
  seller: true,
  images: { orderBy: { position: "asc" } },
  inventory: true,
  reviews: {
    where: { status: ReviewStatus.APPROVED },
    include: { user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" },
    take: 5
  }
} satisfies Prisma.ProductInclude;

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } }
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: productInclude
  });
}

export async function getProducts(params: {
  query?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  brand?: string;
  sort?: string;
  take?: number;
}) {
  const where: Prisma.ProductWhereInput = {
    isActive: true
  };

  if (params.query) {
    where.OR = [
      { name: { contains: params.query, mode: "insensitive" } },
      { description: { contains: params.query, mode: "insensitive" } },
      { brand: { contains: params.query, mode: "insensitive" } }
    ];
  }

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.brand) {
    where.brand = { equals: params.brand, mode: "insensitive" };
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {
      ...(params.minPrice ? { gte: params.minPrice } : {}),
      ...(params.maxPrice ? { lte: params.maxPrice } : {})
    };
  }

  if (params.rating) {
    where.rating = { gte: Number(params.rating) };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.sort === "price-asc"
      ? { price: "asc" }
      : params.sort === "price-desc"
        ? { price: "desc" }
        : params.sort === "newest"
          ? { createdAt: "desc" }
          : { popularity: "desc" };

  return prisma.product.findMany({
    where,
    include: productInclude,
    orderBy,
    take: params.take ?? 60
  });
}

export async function getHomeData() {
  const [categories, featured, deals, newest] = await Promise.all([
    getCategories(),
    getProducts({ take: 8, sort: "popular" }),
    prisma.product.findMany({
      where: { isActive: true, compareAtPrice: { not: null } },
      include: productInclude,
      orderBy: { popularity: "desc" },
      take: 6
    }),
    getProducts({ take: 6, sort: "newest" })
  ]);

  return { categories, featured, deals, newest };
}

export async function getRecommendations(productId: string, categoryId: string) {
  return prisma.product.findMany({
    where: {
      id: { not: productId },
      categoryId,
      isActive: true
    },
    include: productInclude,
    orderBy: [{ rating: "desc" }, { popularity: "desc" }],
    take: 4
  });
}

export async function getBrands() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    distinct: ["brand"],
    select: { brand: true },
    orderBy: { brand: "asc" }
  });

  return products.map((product) => product.brand);
}
