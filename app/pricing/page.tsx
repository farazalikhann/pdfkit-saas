"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const FREE_FEATURES = ["3 tasks per day", "Max 25MB per file", "No batch processing"];
const PRO_FEATURES = [
  "Unlimited tasks",
  "Max 500MB per file",
  "Batch processing",
  "API access",
  "No ads",
];

async function startCheckout(provider: "stripe" | "razorpay") {
  try {
    const res = await fetch(`/api/checkout/${provider}`, { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else toast.info(data.message ?? "Checkout isn't configured in this demo yet.");
  } catch {
    toast.error("Couldn't start checkout. Please try again.");
  }
}

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Simple, honest pricing</h1>
        <p className="text-sm text-muted-foreground">
          Start free. Upgrade any time you need more.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <p className="text-2xl font-bold">$0</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-muted-foreground" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Pro
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                Popular
              </span>
            </CardTitle>
            <p className="text-2xl font-bold">
              $9<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => startCheckout("stripe")}>
                Pay with Stripe
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => startCheckout("razorpay")}
              >
                Pay with Razorpay (India)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
