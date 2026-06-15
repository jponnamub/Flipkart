import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import { createOrderFromCart } from "@/lib/actions";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey?.startsWith("sk_test_")) {
    return NextResponse.redirect(new URL("/checkout?error=stripe-test-key-required", request.url));
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: { product: { include: { images: true } } }
  });

  if (cartItems.length === 0) {
    return NextResponse.redirect(new URL("/cart?error=empty", request.url));
  }

  const order = await createOrderFromCart(session.user.id);
  const stripe = new Stripe(secretKey);
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    client_reference_id: session.user.id,
    customer_email: session.user.email ?? undefined,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber
    },
    line_items: cartItems.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(Number(item.product.price) * 100),
        product_data: {
          name: item.product.name,
          description: item.product.description.slice(0, 300),
          images: item.product.images[0]?.url ? [item.product.images[0].url] : undefined
        }
      }
    })),
    success_url: `${origin}/orders/${order.id}?checkout=success`,
    cancel_url: `${origin}/checkout?checkout=cancelled`
  });

  await prisma.order.update({
    where: { id: order.id },
    data: {
      stripeSessionId: checkoutSession.id,
      payments: {
        updateMany: {
          where: { provider: "stripe" },
          data: { providerReference: checkoutSession.id }
        }
      }
    }
  });

  if (!checkoutSession.url) {
    return NextResponse.redirect(new URL("/checkout?error=stripe-session", request.url));
  }

  return NextResponse.redirect(checkoutSession.url, 303);
}
