import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { autoRechargeApi, paymentMethodsApi, PaymentMethod } from "@/lib/api";

interface AutoRechargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AutoRechargeModal({
  open,
  onOpenChange,
  onSuccess,
}: AutoRechargeModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [threshold, setThreshold] = useState("");
  const [amount, setAmount] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    if (open) {
      fetchSettings();
      fetchPaymentMethods();
    }
  }, [open]);

  const fetchSettings = async () => {
    setLoadingSettings(true);
    try {
      const response = await autoRechargeApi.getSettings();
      if (response.data) {
        setEnabled(response.data.enabled);
        setThreshold(response.data.threshold_cents ? (response.data.threshold_cents / 100).toString() : "");
        setAmount(response.data.amount_cents ? (response.data.amount_cents / 100).toString() : "");
        setMonthlyLimit(response.data.monthly_limit_cents ? (response.data.monthly_limit_cents / 100).toString() : "");
        setPaymentMethodId(response.data.payment_method?.id.toString() || "");
      }
    } catch (error) {
      console.error("Error fetching auto-recharge settings:", error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const fetchPaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    try {
      const response = await paymentMethodsApi.list();
      if (response.data) {
        setPaymentMethods(response.data);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (enabled) {
      if (!threshold || parseFloat(threshold) < 5 || parseFloat(threshold) > 495) {
        toast({
          title: "Validation Error",
          description: "Threshold must be between $5 and $495.",
          variant: "destructive",
        });
        return;
      }

      if (!amount || parseFloat(amount) < 10 || parseFloat(amount) > 500) {
        toast({
          title: "Validation Error",
          description: "Recharge amount must be between $10 and $500.",
          variant: "destructive",
        });
        return;
      }

      if (monthlyLimit && (parseFloat(monthlyLimit) < 10 || parseFloat(monthlyLimit) > 500)) {
        toast({
          title: "Validation Error",
          description: "Monthly limit must be between $10 and $500, or leave empty for no limit.",
          variant: "destructive",
        });
        return;
      }

      if (!paymentMethodId) {
        toast({
          title: "Validation Error",
          description: "Please select a payment method.",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      await autoRechargeApi.updateSettings({
        enabled,
        threshold_cents: enabled && threshold ? Math.round(parseFloat(threshold) * 100) : undefined,
        amount_cents: enabled && amount ? Math.round(parseFloat(amount) * 100) : undefined,
        monthly_limit_cents: enabled && monthlyLimit ? Math.round(parseFloat(monthlyLimit) * 100) : null,
        payment_method_id: enabled && paymentMethodId ? parseInt(paymentMethodId) : null,
      });

      toast({
        title: "Success",
        description: "Auto-recharge settings updated successfully.",
      });
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating auto-recharge settings:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update auto-recharge settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Auto Recharge Settings</DialogTitle>
        </DialogHeader>

        {loadingSettings ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enabled"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="rounded border-border"
                disabled={loading}
              />
              <Label htmlFor="enabled" className="text-sm font-normal cursor-pointer">
                Yes, automatically recharge my card when my credit balance falls below a threshold
              </Label>
            </div>

            {enabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="threshold">When credit balance goes below *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="threshold"
                      type="number"
                      step="0.01"
                      min="5"
                      max="495"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      className="pl-7 bg-secondary/50 border-border"
                      placeholder="5.00"
                      required={enabled}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter an amount between $5 and $495</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Bring credit balance back up to *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="10"
                      max="500"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-7 bg-secondary/50 border-border"
                      placeholder="10.00"
                      required={enabled}
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter an amount between $10 and $500</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthlyLimit">Limit the amount of automatic recharge per month (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="monthlyLimit"
                      type="number"
                      step="0.01"
                      min="10"
                      max="500"
                      value={monthlyLimit}
                      onChange={(e) => setMonthlyLimit(e.target.value)}
                      className="pl-7 bg-secondary/50 border-border"
                      placeholder="Leave empty for no limit"
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enter an amount between $10 and $500. Leave this field empty for no recharge limit.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
                  {loadingPaymentMethods ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Loading payment methods...</span>
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    <div className="p-4 bg-secondary/50 border border-border rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="h-4 w-4" />
                        <span>No payment methods found. Please add a payment method first.</span>
                      </div>
                    </div>
                  ) : (
                    <Select
                      value={paymentMethodId}
                      onValueChange={setPaymentMethodId}
                      disabled={loading}
                    >
                      <SelectTrigger className="bg-secondary/50 border-border">
                        <SelectValue placeholder="Select a payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((pm) => (
                          <SelectItem key={pm.id} value={pm.id.toString()}>
                            {`${pm.brand} •••• ${pm.last4} (Expires ${pm.exp_month}/${pm.exp_year})${pm.is_default ? " (Default)" : ""}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="accent" disabled={loading || loadingSettings}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

