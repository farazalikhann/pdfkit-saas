import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";

export async function POST() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const planId = process.env.RAZORPAY_PRO_PLAN_ID;

  if (!keyId || !keySecret || !planId) {
    return NextResponse.json({
      message:
        "Razorpay isn't configured yet. Set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_PRO_PLAN_ID to enable checkout.",
    });
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const subscription = await razorpay.subscriptions.create({
    plan_id: planId,
    total_count: 12,
  });

  return NextResponse.json({ url: subscription.short_url });
}
