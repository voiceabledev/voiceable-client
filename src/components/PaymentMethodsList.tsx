import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Trash2, Check, Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { paymentMethodsApi, PaymentMethod } from "@/lib/api";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { Badge } from "@/components/ui/badge";

interface PaymentMethodsListProps {
  onPaymentMethodAdded?: () => void;
}

export function PaymentMethodsList({ onPaymentMethodAdded }: PaymentMethodsListProps) {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setLoading(true);
    try {
      const response = await paymentMethodsApi.list();
      if (response.data) {
        setPaymentMethods(response.data);
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    setSettingDefaultId(id);
    try {
      await paymentMethodsApi.setDefault(id);
      toast({
        title: "Success",
        description: "Default payment method updated.",
      });
      fetchPaymentMethods();
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set default payment method.",
        variant: "destructive",
      });
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment method?")) {
      return;
    }

    setDeletingId(id);
    try {
      await paymentMethodsApi.delete(id);
      toast({
        title: "Success",
        description: "Payment method deleted successfully.",
      });
      fetchPaymentMethods();
      onPaymentMethodAdded?.();
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete payment method.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getCardBrandIcon = (brand: string) => {
    const brandLower = brand?.toLowerCase() || "";
    if (brandLower.includes("visa")) return "V";
    if (brandLower.includes("mastercard") || brandLower.includes("master")) return "MC";
    if (brandLower.includes("amex") || brandLower.includes("american")) return "AMEX";
    if (brandLower.includes("discover")) return "D";
    return brand?.charAt(0).toUpperCase() || "?";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Payment Methods</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Payment Method
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-border rounded-lg bg-secondary/30">
          <div className="p-4 bg-secondary/50 rounded-full mb-4">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-base font-medium text-foreground mb-2">No payment methods</p>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            Add a payment method to enable auto-recharge and faster checkout.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {getCardBrandIcon(pm.brand)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">
                      {pm.brand} •••• {pm.last4}
                    </span>
                    {pm.is_default && (
                      <Badge variant="default" className="text-xs">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Expires {pm.exp_month.toString().padStart(2, '0')}/{pm.exp_year}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!pm.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(pm.id)}
                    disabled={settingDefaultId === pm.id}
                  >
                    {settingDefaultId === pm.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Set Default
                      </>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(pm.id)}
                  disabled={deletingId === pm.id}
                  className="text-destructive hover:text-destructive"
                >
                  {deletingId === pm.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <PaymentMethodModal
        open={showAddModal}
        onOpenChange={(open) => {
          setShowAddModal(open);
          if (!open) {
            fetchPaymentMethods();
            onPaymentMethodAdded?.();
          }
        }}
        onSuccess={() => {
          fetchPaymentMethods();
          onPaymentMethodAdded?.();
        }}
      />
    </div>
  );
}

