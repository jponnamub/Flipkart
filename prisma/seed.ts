import { PrismaClient, Role, ReviewStatus, DiscountType, OrderStatus, PaymentStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@localhost:5432/marketplace?schema=public"
});

const prisma = new PrismaClient({ adapter });

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

async function main() {
  await prisma.notificationLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.category.deleteMany();
  await prisma.sellerProfile.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Admin123!", 12);
  const customerPasswordHash = await bcrypt.hash("Customer123!", 12);
  const sellerPasswordHash = await bcrypt.hash("Seller123!", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Marketplace Admin",
      email: "admin@marketplace.local",
      passwordHash,
      role: Role.ADMIN
    }
  });

  const customer = await prisma.user.create({
    data: {
      name: "Demo Customer",
      email: "customer@marketplace.local",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      addresses: {
        create: {
          label: "Home",
          line1: "100 Market Street",
          city: "San Francisco",
          state: "CA",
          postalCode: "94105",
          country: "US",
          isDefault: true
        }
      }
    },
    include: { addresses: true }
  });

  const sellerUser = await prisma.user.create({
    data: {
      name: "Northstar Supply",
      email: "seller@marketplace.local",
      passwordHash: sellerPasswordHash,
      role: Role.SELLER
    }
  });

  const seller = await prisma.sellerProfile.create({
    data: {
      userId: sellerUser.id,
      storeName: "Northstar Supply Co.",
      slug: "northstar-supply",
      description: "Curated everyday tech, home, travel, and wellness essentials.",
      rating: 4.7
    }
  });

  const categories = await Promise.all(
    [
      ["Electronics", "electronics", "Smart devices, audio, and accessories"],
      ["Home & Kitchen", "home-kitchen", "Useful goods for modern homes"],
      ["Fashion", "fashion", "Durable wardrobe staples and accessories"],
      ["Beauty", "beauty", "Personal care and wellness products"],
      ["Sports & Outdoors", "sports-outdoors", "Gear for active lifestyles"],
      ["Books & Learning", "books-learning", "Books, stationery, and learning kits"]
    ].map(([name, slug, description]) =>
      prisma.category.create({
        data: {
          name,
          slug,
          description,
          image: image("photo-1516321318423-f06f85e504b3")
        }
      })
    )
  );

  const categoryBySlug = Object.fromEntries(categories.map((category) => [category.slug, category]));

  const products = [
    {
      name: "Aurora Noise-Canceling Headphones",
      slug: "aurora-noise-canceling-headphones",
      brand: "Aurora",
      category: "electronics",
      price: "129.99",
      compareAtPrice: "179.99",
      popularity: 98,
      isFeatured: true,
      stock: 32,
      lowStockAt: 8,
      imageId: "photo-1505740420928-5e560c06d30e",
      description:
        "Wireless over-ear headphones with adaptive noise cancellation, 40-hour battery life, and fast USB-C charging."
    },
    {
      name: "PulseFit Smartwatch",
      slug: "pulsefit-smartwatch",
      brand: "PulseFit",
      category: "electronics",
      price: "199.00",
      compareAtPrice: "239.00",
      popularity: 92,
      isFeatured: true,
      stock: 18,
      lowStockAt: 6,
      imageId: "photo-1523275335684-37898b6baf30",
      description:
        "Track workouts, sleep, messages, and heart rate from a bright always-on display with multi-day battery."
    },
    {
      name: "Terra Ceramic Cookware Set",
      slug: "terra-ceramic-cookware-set",
      brand: "Terra",
      category: "home-kitchen",
      price: "154.50",
      compareAtPrice: "199.00",
      popularity: 85,
      stock: 11,
      lowStockAt: 5,
      imageId: "photo-1556911220-bff31c812dba",
      description:
        "Non-stick ceramic cookware with stay-cool handles, induction compatibility, and dishwasher-safe finish."
    },
    {
      name: "Lumen Desk Lamp",
      slug: "lumen-desk-lamp",
      brand: "Lumen",
      category: "home-kitchen",
      price: "49.99",
      compareAtPrice: "69.99",
      popularity: 79,
      stock: 4,
      lowStockAt: 7,
      imageId: "photo-1494438639946-1ebd1d20bf85",
      description:
        "Minimal LED task lamp with dimmable warmth settings, wireless charging pad, and compact aluminum body."
    },
    {
      name: "Harbor Weekender Duffel",
      slug: "harbor-weekender-duffel",
      brand: "Harbor",
      category: "fashion",
      price: "89.00",
      compareAtPrice: "119.00",
      popularity: 76,
      stock: 27,
      lowStockAt: 5,
      imageId: "photo-1553062407-98eeb64c6a62",
      description:
        "Water-resistant travel duffel with separate shoe storage, padded laptop sleeve, and recycled fabric."
    },
    {
      name: "Everyday Knit Sneakers",
      slug: "everyday-knit-sneakers",
      brand: "Stride",
      category: "fashion",
      price: "74.99",
      compareAtPrice: "94.99",
      popularity: 88,
      stock: 39,
      lowStockAt: 10,
      imageId: "photo-1542291026-7eec264c27ff",
      description:
        "Breathable knit sneakers with cushioned soles, washable uppers, and a lightweight commuter profile."
    },
    {
      name: "GlowLab Hydration Serum",
      slug: "glowlab-hydration-serum",
      brand: "GlowLab",
      category: "beauty",
      price: "32.00",
      compareAtPrice: "40.00",
      popularity: 70,
      stock: 55,
      lowStockAt: 12,
      imageId: "photo-1556228720-195a672e8a03",
      description:
        "Fragrance-free daily serum with hyaluronic acid, niacinamide, and barrier-supporting botanicals."
    },
    {
      name: "Summit Trail Backpack",
      slug: "summit-trail-backpack",
      brand: "Summit",
      category: "sports-outdoors",
      price: "118.00",
      compareAtPrice: "149.00",
      popularity: 83,
      stock: 7,
      lowStockAt: 8,
      imageId: "photo-1500530855697-b586d89ba3ee",
      description:
        "30L trail backpack with ventilated back panel, hydration routing, rain cover, and compression straps."
    },
    {
      name: "FlexPro Resistance Kit",
      slug: "flexpro-resistance-kit",
      brand: "FlexPro",
      category: "sports-outdoors",
      price: "44.99",
      compareAtPrice: "59.99",
      popularity: 64,
      stock: 21,
      lowStockAt: 6,
      imageId: "photo-1518611012118-696072aa579a",
      description:
        "Stackable resistance bands, door anchor, handles, and workout guide packed in a compact travel pouch."
    },
    {
      name: "Modern Product Strategy",
      slug: "modern-product-strategy",
      brand: "Northstar Press",
      category: "books-learning",
      price: "24.00",
      compareAtPrice: "30.00",
      popularity: 57,
      stock: 63,
      lowStockAt: 10,
      imageId: "photo-1524995997946-a1c2e315a42f",
      description:
        "A practical guide to marketplace, subscription, and platform product decisions for growing teams."
    }
  ];

  const createdProducts = [];

  for (const product of products) {
    const created = await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        popularity: product.popularity,
        isFeatured: product.isFeatured ?? false,
        dealEndsAt: product.compareAtPrice ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 10) : null,
        categoryId: categoryBySlug[product.category].id,
        sellerId: seller.id,
        images: {
          create: [
            {
              url: image(product.imageId),
              alt: product.name,
              position: 0
            }
          ]
        },
        inventory: {
          create: {
            quantity: product.stock,
            lowStockAt: product.lowStockAt,
            sku: `SKU-${product.slug.toUpperCase().replaceAll("-", "-").slice(0, 24)}`,
            warehouse: "West Coast Fulfillment"
          }
        }
      }
    });
    createdProducts.push(created);
  }

  for (const product of createdProducts.slice(0, 7)) {
    await prisma.review.createMany({
      data: [
        {
          userId: customer.id,
          productId: product.id,
          rating: 5,
          title: "Excellent quality",
          comment: "Arrived quickly, matched the description, and feels durable.",
          status: ReviewStatus.APPROVED
        },
        {
          userId: admin.id,
          productId: product.id,
          rating: 4,
          title: "Strong value",
          comment: "Good balance of price, finish, and day-to-day usefulness.",
          status: ReviewStatus.APPROVED
        }
      ]
    });

    const aggregate = await prisma.review.aggregate({
      where: { productId: product.id, status: ReviewStatus.APPROVED },
      _avg: { rating: true },
      _count: { rating: true }
    });

    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: aggregate._avg.rating ?? 0,
        reviewCount: aggregate._count.rating
      }
    });
  }

  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        description: "10% off first order over $50",
        discountType: DiscountType.PERCENTAGE,
        amount: "10.00",
        minSpend: "50.00",
        startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90),
        maxRedemptions: 500
      },
      {
        code: "SHIPFREE",
        description: "$8 off shipping-ready baskets",
        discountType: DiscountType.FIXED,
        amount: "8.00",
        minSpend: "75.00",
        startsAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45),
        maxRedemptions: 250
      }
    ]
  });

  await prisma.cartItem.create({
    data: {
      userId: customer.id,
      productId: createdProducts[0].id,
      quantity: 1
    }
  });

  await prisma.wishlistItem.create({
    data: {
      userId: customer.id,
      productId: createdProducts[1].id
    }
  });

  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: `ORD-${Date.now()}`,
      userId: customer.id,
      addressId: customer.addresses[0].id,
      status: OrderStatus.SHIPPED,
      paymentStatus: PaymentStatus.PAID,
      subtotal: "129.99",
      shippingTotal: "8.00",
      taxTotal: "10.40",
      total: "148.39",
      trackingNumber: "TRK-DEMO-1001",
      items: {
        create: {
          productId: createdProducts[0].id,
          name: createdProducts[0].name,
          image: image("photo-1505740420928-5e560c06d30e"),
          quantity: 1,
          price: "129.99"
        }
      },
      payments: {
        create: {
          provider: "stripe",
          providerReference: "seeded-test-payment",
          status: PaymentStatus.PAID,
          amount: "148.39"
        }
      },
      notifications: {
        create: {
          userId: customer.id,
          type: "ORDER_STATUS_READY",
          channel: "email",
          payload: {
            subject: "Your order has shipped",
            template: "order-status-update",
            orderNumber: "seeded"
          },
          sentAt: null
        }
      }
    }
  });

  console.log("Seed complete.");
  console.log("Admin: admin@marketplace.local / Admin123!");
  console.log("Seller: seller@marketplace.local / Seller123!");
  console.log("Customer: customer@marketplace.local / Customer123!");
  console.log(`Sample order: ${sampleOrder.orderNumber}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
