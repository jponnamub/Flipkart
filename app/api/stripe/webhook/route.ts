import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey?.startsWith("sk_test_") || !webhookSecret) {
    return NextResponse.json({ error: "Stripe test webhook is not configured" }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);
  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const checkout = event.data.object;
    const orderId = checkout.metadata?.orderId;

    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PAID,
          paymentStatus: PaymentStatus.PAID,
          payments: {
            updateMany: {
              where: { provider: "stripe" },
              data: {
                status: PaymentStatus.PAID,
                providerReference: checkout.id
              }
            }
          }
        },
        include: { items: true }
      });

      for (const item of order.items) {
        await prisma.inventory.updateMany({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
      }

      await prisma.cartItem.deleteMany({ where: { userId: order.userId } });
    }
  }

  return NextResponse.json({ received: true });
}
