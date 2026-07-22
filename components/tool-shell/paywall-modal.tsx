"use client";

import { Check, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PRO_PERKS = [
  "Unlimited tasks, every day",
  "Files up to 500MB",
  "Batch processing",
  "API access, no ads",
];

export function PaywallModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  async function handleUpgrade() {
    try {
      const res = await fetch("/api/checkout/stripe", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.info(data.message ?? "Checkout isn't configured in this demo yet.");
      }
    } catch {
      toast.error("Couldn't start checkout. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center">
            You&apos;ve hit today&apos;s free limit
          </DialogTitle>
          <DialogDescription className="text-center">
            Your file is ready — upgrade to PDFKit Pro to unlock the download,
            plus unlimited tasks every day.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 rounded-xl bg-muted/50 p-4">
          {PRO_PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 shrink-0 text-primary" />
              {perk}
            </li>
          ))}
        </ul>

        <DialogFooter className="sm:flex-col sm:space-x-0">
          <Button size="lg" className="w-full" onClick={handleUpgrade}>
            Upgrade to Pro
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
