import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Coins } from "lucide-react";

interface PurchaseCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

export function PurchaseCreditsModal({
  open,
  onOpenChange,
  currentBalance,
}: PurchaseCreditsModalProps) {
  const [amount, setAmount] = useState("10");

  const amountNum = parseFloat(amount) || 0;
  const newBalance = currentBalance + amountNum;

  const handlePurchase = () => {
    // Here you would integrate with payment processing
    console.log("Purchasing", amountNum, "credits");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Purchase Vapi Credits</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Balance Preview */}
          <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              You're adding{" "}
              <span className="inline-flex items-center gap-1 text-foreground font-medium">
                <DollarSign className="h-4 w-4 text-success" />
                {amountNum}
              </span>{" "}
              your new balance will be{" "}
              <span className="inline-flex items-center gap-1 text-foreground font-medium">
                <Coins className="h-4 w-4 text-primary" />
                {newBalance} credits
              </span>
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount to Purchase</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-7 bg-secondary/50 border-border"
                min="1"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handlePurchase} disabled={amountNum <= 0}>
              Purchase
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}