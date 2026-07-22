"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Mail, Trash2 } from "lucide-react";
import { useUsageStore } from "@/lib/store/usage-store";
import { useRecentStore } from "@/lib/store/recent-store";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FREE_TIER, PRO_TIER } from "@/lib/constants";
import { toast } from "sonner";

export default function AccountPage() {
  const [email, setEmail] = React.useState("");
  const isPro = useUsageStore((s) => s.isPro);
  const tasksUsedToday = useUsageStore((s) => s.tasksUsedToday);
  const clearRecent = useRecentStore((s) => s.clear);
  const tier = isPro ? PRO_TIER : FREE_TIER;

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) {
      toast.info("Sign-in isn't configured yet", {
        description:
          "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable magic-link sign-in.",
      });
      return;
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) toast.error(error.message);
    else toast.success("Check your inbox for a sign-in link.");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-5">
      <div>
        <h1 className="text-xl font-bold">Account</h1>
        <p className="text-sm text-muted-foreground">
          Manage your plan and sign-in.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sign in</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="flex gap-2">
            <Input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" className="shrink-0 gap-1.5">
              <Mail className="h-4 w-4" />
              Send link
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>Your plan</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {isPro ? "PRO" : "FREE"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tasks today</span>
              <span className="font-medium">
                {tasksUsedToday} / {tier.tasksPerDay === Infinity ? "∞" : tier.tasksPerDay}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Max file size</span>
              <span className="font-medium">
                {Math.round(tier.maxFileSizeBytes / (1024 * 1024))}MB
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Batch processing</span>
              <span className="font-medium">{tier.batchProcessing ? "Yes" : "No"}</span>
            </div>
          </div>
          {!isPro && (
            <Button asChild className="w-full gap-1.5">
              <Link href="/pricing">
                <Sparkles className="h-4 w-4" />
                Upgrade to Pro
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full gap-1.5"
            onClick={() => {
              clearRecent();
              toast.success("Recent history cleared");
            }}
          >
            <Trash2 className="h-4 w-4" />
            Clear recent history
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
