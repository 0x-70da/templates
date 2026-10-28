import type { Request, Response } from "express";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe.js";
import { markOrderPaid } from "./queries/markOrderPaid.query.js";
import { cancelUnpaidOrder } from "./queries/cancelUnpaidOrder.query.js";

export const stripeWebhook = async (req: Request, res: Response) => {
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, // raw Buffer
      req.headers["stripe-signature"] as string,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.payment_status === "paid") {
      await markOrderPaid(
        s.id,
        typeof s.payment_intent === "string" ? s.payment_intent : null,
      );
    }
  }

  if (event.type === "checkout.session.expired") {
    const s = event.data.object as Stripe.Checkout.Session;
    await cancelUnpaidOrder(s.metadata!.orderId!, "checkout expired");
  }

  res.json({ received: true });
};
