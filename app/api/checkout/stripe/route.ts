import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!secretKey || !priceId) {
    return NextResponse.json({
      message:
        "Stripe isn't configured yet. Set STRIPE_SECRET_KEY and STRIPE_PRO_PRICE_ID to enable checkout.",
    });
  }

  const stripe = new Stripe(secretKey);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/account?upgraded=1`,
    cancel_url: `${siteUrl}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
