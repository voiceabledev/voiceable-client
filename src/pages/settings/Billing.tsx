import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CreditCard,
  Pencil,
  ArrowLeft,
  Mail,
  Loader2
} from "lucide-react";
import { PurchaseCreditsModal } from "@/components/PurchaseCreditsModal";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { paymentsApi, Payment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [autoReload, setAutoReload] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showContactSalesModal, setShowContactSalesModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [currentBalance] = useState(10);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("openModal") === "true") {
      setShowPurchaseModal(true);
      searchParams.delete("openModal");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const response = await paymentsApi.list();
      if (response.data) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payment history.",
        variant: "destructive",
      });
    } finally {
      setLoadingPayments(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "succeeded":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      case "canceled":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "succeeded":
        return "Completed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      case "canceled":
        return "Canceled";
      default:
        return status;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Plans</h2>
            <p className="hidden md:block text-sm md:text-base text-muted-foreground">
              Select a plan for your organization. <span className="font-semibold text-foreground">Bundled minutes</span> include the cost of every provider used during a call (LLM, TTS, STT, etc.). <span className="font-semibold text-foreground">Overage cost</span> applies when you exceed your bundled minutes.
            </p>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-6xl p-4 md:p-6 pr-4 md:pr-6 space-y-6 md:space-y-8">
          {/* Description - Mobile only */}
          <p className="md:hidden text-sm text-muted-foreground">
            Select a plan for your organization. <span className="font-semibold text-foreground">Bundled minutes</span> include the cost of every provider used during a call (LLM, TTS, STT, etc.). <span className="font-semibold text-foreground">Overage cost</span> applies when you exceed your bundled minutes.
          </p>
          
          {/* Plans Section */}
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {/* Usage Based Plan */}
              <div className="bg-secondary/50 border border-accent rounded-lg p-4 md:p-6">
                <p className="text-xs md:text-sm text-muted-foreground mb-1">Usage Based</p>
                <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Pay as you go</h3>
                
                <div className="space-y-2 text-xs md:text-sm mb-4 md:mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bundled minutes:</span>
                    <span>-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bundled minutes overage cost:</span>
                    <span>-</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Concurrency included:</span>
                    <span>10</span>
                  </div>
                </div>

                <p className="text-accent font-medium text-sm md:text-base">Current Plan</p>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-secondary/30 border border-border rounded-lg p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 md:mb-4">
                  <div>
                    <p className="text-xs md:text-sm text-muted-foreground mb-1">Enterprise</p>
                    <h3 className="text-xl md:text-2xl font-semibold">Custom <span className="text-xs md:text-sm font-normal text-muted-foreground">/annual contract</span></h3>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground">Starting at 600,000/year</p>
                </div>
                
                <div className="space-y-2 text-xs md:text-sm mb-4 md:mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bundled minutes:</span>
                    <span>Custom</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bundled minutes overage cost:</span>
                    <span>Custom</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Concurrency included:</span>
                    <span>Custom</span>
                  </div>
                </div>

                <Button variant="accent" className="w-full text-xs md:text-sm" onClick={() => setShowContactSalesModal(true)}>
                  <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  Contact Sales
                </Button>
              </div>
            </div>
          </section>

          {/* Payment Method Section */}
          <section>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Payment Method</h3>
            <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6">Enter your card details</p>

            <div className="bg-secondary/30 border border-border rounded-lg p-4 md:p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm md:text-base">Billing Email</Label>
                <div className="relative">
                  <Input 
                    value="vbrazo@gmail.com" 
                    className="bg-secondary/50 pr-10 h-9 md:h-10 text-sm"
                    readOnly
                  />
                  <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm md:text-base">Payment Method</Label>
                <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md px-2 md:px-3 py-2">
                  <div className="w-7 h-4 md:w-8 md:h-5 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                  </div>
                  <span className="text-xs md:text-sm text-muted-foreground truncate">Número do cartão</span>
                  <div className="ml-auto flex items-center gap-1 md:gap-2 flex-shrink-0">
                    <span className="text-xs bg-accent/20 text-accent px-1.5 md:px-2 py-0.5 rounded">link</span>
                    <span className="text-xs md:text-sm text-foreground">●●●● 5695</span>
                    <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full text-xs md:text-sm"
                  onClick={() => setShowPaymentMethodModal(true)}
                >
                  <CreditCard className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                {/* <div className="flex items-center justify-between">
                  <Label className="text-sm md:text-base">Enable Auto Reload</Label>
                  <Switch checked={autoReload} onCheckedChange={setAutoReload} />
                </div> */}

                {autoReload && (
                  <div className="mt-4 space-y-3">
                    <div className="space-y-2">
                      <Label className="text-sm md:text-base">Amount to reload</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input 
                          defaultValue="10" 
                          className="bg-secondary/50 pl-7 h-9 md:h-10 text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm md:text-base">When threshold reaches</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input 
                          defaultValue="10" 
                          className="bg-secondary/50 pl-7 h-9 md:h-10 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Credit Purchase History Section */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">Credit Purchase History</h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  Credit purchases are charged to your payment method.
                </p>
              </div>
            </div>

            {loadingPayments ? (
              <div className="flex items-center justify-center py-12 bg-secondary/30 border border-border rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : payments.length === 0 ? (
              <div className="bg-secondary/30 border border-border rounded-lg p-8 md:p-12 text-center">
                <p className="text-muted-foreground text-sm md:text-base">No data available</p>
              </div>
            ) : (
              <div className="bg-secondary/30 border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50 border-b border-border">
                      <tr>
                        <th className="text-left p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground">Date</th>
                        <th className="text-left p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground">Amount</th>
                        <th className="text-left p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground">Payment Method</th>
                        <th className="text-left p-3 md:p-4 text-xs md:text-sm font-medium text-muted-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors">
                          <td className="p-3 md:p-4 text-xs md:text-sm">
                            {format(new Date(payment.created_at), "MMM d, yyyy")}
                          </td>
                          <td className="p-3 md:p-4 text-xs md:text-sm font-medium">
                            ${payment.amount_dollars.toFixed(2)}
                          </td>
                          <td className="p-3 md:p-4">
                            <Badge variant={getStatusBadgeVariant(payment.status)}>
                              {getStatusLabel(payment.status)}
                            </Badge>
                          </td>
                          <td className="p-3 md:p-4 text-xs md:text-sm text-muted-foreground">
                            {payment.payment_method ? (
                              <span>
                                {payment.payment_method.brand.toUpperCase()} •••• {payment.payment_method.last4}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">N/A</span>
                            )}
                          </td>
                          <td className="p-3 md:p-4 text-xs md:text-sm text-muted-foreground">
                            {payment.description || "Payment"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modals */}
      <PurchaseCreditsModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        currentBalance={currentBalance}
      />

      <Dialog open={showContactSalesModal} onOpenChange={setShowContactSalesModal}>
        <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle>Schedule a Meeting</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0">
            <iframe
              src="https://calendly.com"
              className="w-full h-full border-0"
              title="Calendly Scheduling"
              allow="camera; microphone; geolocation"
            />
          </div>
        </DialogContent>
      </Dialog>

      <PaymentMethodModal
        open={showPaymentMethodModal}
        onOpenChange={setShowPaymentMethodModal}
        onSuccess={() => {
          fetchPayments();
        }}
      />
    </div>
  );
}
