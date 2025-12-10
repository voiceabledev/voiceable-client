import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  CreditCard,
  ArrowLeft,
  Mail,
  Loader2,
  Building2,
  Zap,
  Check,
  History,
  TrendingUp,
  Wallet,
  Calendar,
  Sparkles
} from "lucide-react";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { paymentsApi, Payment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showContactSalesModal, setShowContactSalesModal] = useState(false);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("openModal") === "true") {
      setShowPaymentMethodModal(true);
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

  // Fetch credit balance
  const fetchCreditBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const response = await paymentsApi.creditBalance();
      if (response.data) {
        setCreditBalance(response.data.balance);
      } else {
        setCreditBalance(0);
      }
    } catch (error) {
      console.error("Error fetching credit balance:", error);
      // Set default value on error
      setCreditBalance(0);
      toast({
        title: "Error",
        description: "Failed to load credit balance.",
        variant: "destructive",
      });
    } finally {
      setLoadingBalance(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCreditBalance();
  }, [fetchCreditBalance]);

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
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="flex-shrink-0 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Billing & Plans
            </h2>
            {/* <p className="hidden md:block text-sm md:text-base text-muted-foreground leading-relaxed max-w-3xl">
              Select a plan for your organization. <span className="font-semibold text-foreground">Bundled minutes</span> include the cost of every provider used during a call (LLM, TTS, STT, etc.). <span className="font-semibold text-foreground">Overage cost</span> applies when you exceed your bundled minutes.
            </p> */}
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Credit Balance Card */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-primary/20 rounded-lg">
                  <Wallet className="h-5 w-5 text-primary" />
                    </div>
                  </div>
              <p className="text-sm text-muted-foreground mb-1">Credit Balance</p>
              {loadingBalance ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  ${creditBalance.toFixed(2)}
                </p>
              )}
                </div>
                
            {/* Recent Payments Card */}
            <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-secondary/50 rounded-lg">
                  <History className="h-5 w-5 text-muted-foreground" />
                </div>
                  </div>
              <p className="text-sm text-muted-foreground mb-1">Total Payments</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                {payments.filter(p => p.status === 'succeeded').length}
              </p>
                  </div>

            {/* Quick Action Card */}
            <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Need more credits?</p>
                <Button
                variant="default"
                size="sm"
                className="w-full"
                  onClick={() => setShowPaymentMethodModal(true)}
                >
                <CreditCard className="h-4 w-4 mr-2" />
                  Buy Credits
                </Button>
            </div>
              </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Plan Section - Takes 1 column */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-card via-card to-secondary/20 border border-border rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-primary/20 rounded-xl">
                      <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Plan</p>
                      <h3 className="text-xl md:text-2xl font-bold">Pay as you go</h3>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Flexible pricing that scales with your usage. Pay only for what you use.
                  </p>

                  <div className="space-y-3">
                    <Button 
                      variant="default"
                      className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-all"
                      onClick={() => setShowPaymentMethodModal(true)}
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Add Credits
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full h-12 text-base font-medium border-primary/20 hover:bg-primary/5 transition-all"
                      onClick={() => setShowContactSalesModal(true)}
                    >
                      <Building2 className="h-5 w-5 mr-2" />
                      Upgrade to Enterprise
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History - Takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                  Payment History
              </h2>
                <p className="text-sm text-muted-foreground mt-1">View all your credit purchases</p>
            </div>
            
            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
              {loadingPayments ? (
                <div className="flex flex-col items-center justify-center py-16 md:py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-sm md:text-base text-muted-foreground">Loading payment history...</p>
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 md:py-20 px-4">
                  <div className="p-4 bg-secondary/50 rounded-full mb-4">
                    <History className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-base md:text-lg font-medium text-foreground mb-2">No payment history</p>
                    <p className="text-sm md:text-base text-muted-foreground text-center max-w-md mb-6">
                    Credit purchases will appear here once you make your first purchase.
                  </p>
                  <Button
                      variant="default"
                    onClick={() => setShowPaymentMethodModal(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Buy Credits
                  </Button>
                </div>
              ) : (
                  <div className="divide-y divide-border">
                    {payments.map((payment) => (
                      <div
                          key={payment.id} 
                        className="p-4 md:p-6 hover:bg-secondary/30 transition-colors group"
                        >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="p-2.5 bg-secondary/50 rounded-lg group-hover:bg-secondary/70 transition-colors">
                              <TrendingUp className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <p className="text-base md:text-lg font-semibold text-foreground">
                              ${payment.amount_dollars.toFixed(2)}
                                </p>
                            <Badge 
                              variant={getStatusBadgeVariant(payment.status)}
                                  className="text-xs"
                            >
                              {getStatusLabel(payment.status)}
                            </Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{format(new Date(payment.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showContactSalesModal} onOpenChange={setShowContactSalesModal}>
        <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle>Schedule a Meeting</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0">
            <iframe
              src="https://calendly.com/imvitoroliveira"
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
          fetchCreditBalance();
        }}
      />
    </div>
  );
}
