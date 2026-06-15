import { OrderStatus, PaymentStatus, ReviewStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getAdminDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    users,
    sellers,
    products,
    orders,
    revenue,
    monthRevenue,
    lowStock,
    pendingReviews,
    recentOrders
  ] = await Promise.all([
    prisma.user.count(),
    prisma.sellerProfile.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { paymentStatus: PaymentStatus.PAID },
      _sum: { total: true }
    }),
    prisma.order.aggregate({
      where: { paymentStatus: PaymentStatus.PAID, createdAt: { gte: startOfMonth } },
      _sum: { total: true }
    }),
    prisma.inventory.findMany({
      include: { product: { include: { images: true } } },
      orderBy: { quantity: "asc" },
      take: 30
    }),
    prisma.review.count({ where: { status: ReviewStatus.PENDING } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: true, items: true }
    })
  ]);

  const revenueChart = await getRevenueChartData();

  return {
    users,
    sellers,
    products,
    orders,
    revenue: Number(revenue._sum.total ?? 0),
    monthRevenue: Number(monthRevenue._sum.total ?? 0),
    lowStock: lowStock.filter((item) => item.quantity <= item.lowStockAt).slice(0, 8),
    pendingReviews,
    recentOrders,
    revenueChart
  };
}

export async function getRevenueChartData() {
  const orders = await prisma.order.findMany({
    where: {
      paymentStatus: PaymentStatus.PAID,
      status: { notIn: [OrderStatus.CANCELLED, OrderStatus.REFUNDED] }
    },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: "asc" }
  });

  const buckets = new Map<string, number>();
  for (const order of orders) {
    const key = order.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    buckets.set(key, (buckets.get(key) ?? 0) + Number(order.total));
  }

  return Array.from(buckets.entries()).map(([date, revenue]) => ({
    date,
    revenue: Number(revenue.toFixed(2))
  }));
}

export async function getAdminProducts() {
  return prisma.product.findMany({
    include: { category: true, seller: true, inventory: true, images: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAdminOrders() {
  return prisma.order.findMany({
    include: { user: true, items: true, payments: true },
    orderBy: { createdAt: "desc" }
  });
}

export async function getAdminReviews() {
  return prisma.review.findMany({
    include: { product: true, user: true },
    orderBy: { createdAt: "desc" }
  });
}
