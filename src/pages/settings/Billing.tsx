import { useState, useEffect, useCallback, useMemo } from "react";
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
  Sparkles,
  DollarSign,
  ArrowDown,
  ArrowUp,
  Phone,
  Clock,
  MessageSquare,
  Settings
} from "lucide-react";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { AutoRechargeModal } from "@/components/AutoRechargeModal";
import { PaymentMethodsList } from "@/components/PaymentMethodsList";
import { CreditGrantsTable } from "@/components/CreditGrantsTable";
import { paymentsApi, Payment, CreditTransaction, autoRechargeApi, AutoRechargeSettings } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [creditStats, setCreditStats] = useState<{
    total_payments_cents: number;
    total_refunds_cents: number;
    total_deductions_cents: number;
  } | null>(null);
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [showAutoRechargeModal, setShowAutoRechargeModal] = useState(false);
  const [autoRechargeSettings, setAutoRechargeSettings] = useState<AutoRechargeSettings | null>(null);
  const [loadingAutoRecharge, setLoadingAutoRecharge] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
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
        setCreditStats({
          total_payments_cents: response.data.total_payments_cents || 0,
          total_refunds_cents: response.data.total_refunds_cents || 0,
          total_deductions_cents: response.data.total_deductions_cents || 0,
        });
      } else {
        setCreditBalance(0);
        setCreditStats(null);
      }
    } catch (error) {
      console.error("Error fetching credit balance:", error);
      // Set default value on error
      setCreditBalance(0);
      setCreditStats(null);
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

  // Fetch credit transactions (conversation spending)
  const fetchCreditTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    try {
      const response = await paymentsApi.creditTransactions({ limit: 100 });
      if (response.data) {
        setCreditTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error("Error fetching credit transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load conversation spending.",
        variant: "destructive",
      });
    } finally {
      setLoadingTransactions(false);
    }
  }, [toast]);

  const fetchAutoRechargeSettings = useCallback(async () => {
    setLoadingAutoRecharge(true);
    try {
      const response = await autoRechargeApi.getSettings();
      if (response.data) {
        setAutoRechargeSettings(response.data);
      }
    } catch (error) {
      console.error("Error fetching auto-recharge settings:", error);
    } finally {
      setLoadingAutoRecharge(false);
    }
  }, []);

  useEffect(() => {
    fetchCreditTransactions();
    fetchAutoRechargeSettings();
  }, [fetchCreditTransactions, fetchAutoRechargeSettings]);

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

  // Calculate spending breakdown
  const spendingBreakdown = useMemo(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const successfulPayments = payments.filter(p => p.status === 'succeeded');

    const allTime = successfulPayments.reduce((sum, p) => sum + p.amount_dollars, 0);

    const thisMonth = successfulPayments
      .filter(p => new Date(p.created_at) >= thisMonthStart)
      .reduce((sum, p) => sum + p.amount_dollars, 0);

    const lastMonth = successfulPayments
      .filter(p => {
        const paymentDate = new Date(p.created_at);
        return paymentDate >= lastMonthStart && paymentDate <= lastMonthEnd;
      })
      .reduce((sum, p) => sum + p.amount_dollars, 0);

    const totalPurchased = creditStats ? (creditStats.total_payments_cents / 100) : allTime;
    const totalUsed = creditStats ? (creditStats.total_deductions_cents / 100) : 0;
    const totalRefunded = creditStats ? (creditStats.total_refunds_cents / 100) : 0;

    return {
      allTime,
      thisMonth,
      lastMonth,
      totalPurchased,
      totalUsed,
      totalRefunded,
      currentBalance: creditBalance,
    };
  }, [payments, creditStats, creditBalance]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings")}
            className="flex-shrink-0 hover:bg-secondary h-8 w-8 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
          <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">Billing & Add-Ons</h1>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 mb-4 sm:mb-6">
              <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-5 md:min-w-0 px-4 sm:px-0">
                <TabsTrigger value="overview" className="whitespace-nowrap min-w-max md:min-w-0 text-xs sm:text-sm px-3 sm:px-4">Overview</TabsTrigger>
                <TabsTrigger value="conversation_history" className="whitespace-nowrap min-w-max md:min-w-0 text-xs sm:text-sm px-3 sm:px-4">Conversation History</TabsTrigger>
                <TabsTrigger value="payment_methods" className="whitespace-nowrap min-w-max md:min-w-0 text-xs sm:text-sm px-3 sm:px-4">Payment Methods</TabsTrigger>
                <TabsTrigger value="credit_grants" className="whitespace-nowrap min-w-max md:min-w-0 text-xs sm:text-sm px-3 sm:px-4">Credit Grants</TabsTrigger>
                <TabsTrigger value="history" className="whitespace-nowrap min-w-max md:min-w-0 text-xs sm:text-sm px-3 sm:px-4">Billing History</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Credit Balance & Payments Card */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-4 sm:p-5 md:p-6 shadow-sm">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                    <div className="p-2 sm:p-2.5 bg-primary/20 rounded-lg">
                      <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Account Summary</p>
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {/* Credit Balance */}
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Credit Balance</p>
                      {loadingBalance ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-muted-foreground" />
                          <span className="text-xs sm:text-sm text-muted-foreground">Loading...</span>
                        </div>
                      ) : (
                        <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                          ${creditBalance.toFixed(2)}
                        </p>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="border-t border-primary/20"></div>

                    {/* Total Payments */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                        <p className="text-xs sm:text-sm text-muted-foreground">Total Payments</p>
                      </div>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                        {payments.filter(p => p.status === 'succeeded').length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Plan Card */}
                <div className="bg-gradient-to-br from-card via-card to-secondary/20 border border-border rounded-xl p-4 sm:p-5 md:p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <div className="relative">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="p-2 sm:p-2.5 bg-primary/20 rounded-lg">
                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Current Plan</p>
                        <h3 className="text-base sm:text-lg md:text-xl font-bold">Pay as you go</h3>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
                      Flexible pricing that scales with your usage.
                    </p>

                    <div className="space-y-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full text-xs sm:text-sm font-medium shadow-md hover:shadow-lg transition-all h-9 sm:h-10"
                        onClick={() => setShowPaymentMethodModal(true)}
                      >
                        <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        Add Credits
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs sm:text-sm font-medium border-primary/20 hover:bg-primary/5 transition-all h-9 sm:h-10"
                        onClick={() => setShowContactSalesModal(true)}
                      >
                        <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        Upgrade to Enterprise
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spending Breakdown Section */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Spending Breakdown
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Overview of your credit purchases and usage</p>
                </div>

                {loadingBalance || loadingPayments ? (
                  <div className="flex items-center justify-center py-8 sm:py-12">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                    {/* Total Purchased */}
                    <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Purchased</p>
                        <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                        ${spendingBreakdown.totalPurchased.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">All time</p>
                    </div>

                    {/* Total Used */}
                    <div className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-transparent border border-orange-500/20 rounded-lg p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Used</p>
                        <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
                      </div>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                        ${spendingBreakdown.totalUsed.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {spendingBreakdown.totalPurchased > 0
                          ? `${((spendingBreakdown.totalUsed / spendingBreakdown.totalPurchased) * 100).toFixed(1)}% of purchased`
                          : 'No usage yet'}
                      </p>
                    </div>

                    {/* Current Balance */}
                    <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-lg p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Balance</p>
                        <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                      </div>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                        ${spendingBreakdown.currentBalance.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {spendingBreakdown.totalPurchased > 0
                          ? `${((spendingBreakdown.currentBalance / spendingBreakdown.totalPurchased) * 100).toFixed(1)}% remaining`
                          : 'No credits'}
                      </p>
                    </div>

                    {/* This Month */}
                    <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 rounded-lg p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">This Month</p>
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                      </div>
                      <p className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                        ${spendingBreakdown.thisMonth.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {spendingBreakdown.lastMonth > 0
                          ? `${spendingBreakdown.thisMonth >= spendingBreakdown.lastMonth ? '+' : ''}${((spendingBreakdown.thisMonth - spendingBreakdown.lastMonth) / spendingBreakdown.lastMonth * 100).toFixed(1)}% vs last month`
                          : 'No previous month data'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Time Period Breakdown */}
                {!loadingBalance && !loadingPayments && (
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-3 sm:mb-4">Spending by Period</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-secondary/30 rounded-lg p-3 sm:p-4 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">This Month</p>
                        <p className="text-lg sm:text-xl font-bold text-foreground">${spendingBreakdown.thisMonth.toFixed(2)}</p>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-3 sm:p-4 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Last Month</p>
                        <p className="text-lg sm:text-xl font-bold text-foreground">${spendingBreakdown.lastMonth.toFixed(2)}</p>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-3 sm:p-4 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">All Time</p>
                        <p className="text-lg sm:text-xl font-bold text-foreground">${spendingBreakdown.allTime.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Auto-Recharge Section */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Auto Recharge
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Automatically recharge your credits when balance is low</p>
                </div>

                {loadingAutoRecharge ? (
                  <div className="flex items-center justify-center py-6 sm:py-8">
                    <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
                  </div>
                ) : autoRechargeSettings?.enabled ? (
                  <div className="p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base font-semibold text-green-600 dark:text-green-400">Auto recharge is on</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                          When your credit balance reaches ${autoRechargeSettings.threshold_cents ? (autoRechargeSettings.threshold_cents / 100).toFixed(2) : '0.00'},
                          your payment method will be charged to bring the balance up to ${autoRechargeSettings.amount_cents ? (autoRechargeSettings.amount_cents / 100).toFixed(2) : '0.00'}.
                        </p>
                        {autoRechargeSettings.monthly_limit_cents && (
                          <p className="text-xs text-muted-foreground">
                            Monthly limit: ${(autoRechargeSettings.monthly_limit_cents / 100).toFixed(2)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAutoRechargeModal(true)}
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        Modify
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                          <span className="text-sm sm:text-base font-semibold text-yellow-600 dark:text-yellow-400">Auto recharge is off</span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                          When your credit balance reaches $0, your API requests will stop working. Enable automatic recharge to automatically keep your credit balance topped up.
                        </p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => setShowAutoRechargeModal(true)}
                        className="w-full sm:w-auto text-xs sm:text-sm"
                      >
                        Enable Auto Recharge
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Access Shortcuts */}
              <div className="bg-card border border-border rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Quick Access
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground">Navigate to other billing sections</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* Conversation History Shortcut */}
                  <button
                    onClick={() => setActiveTab("conversation_history")}
                    className="p-3 sm:p-4 bg-card border border-border rounded-lg hover:bg-secondary/50 hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-xs sm:text-sm">Conversation History</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      View conversation spending and costs
                    </p>
                  </button>

                  {/* Payment Methods Shortcut */}
                  <button
                    onClick={() => setActiveTab("payment_methods")}
                    className="p-3 sm:p-4 bg-card border border-border rounded-lg hover:bg-secondary/50 hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-xs sm:text-sm">Payment Methods</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Manage saved payment methods
                    </p>
                  </button>

                  {/* Credit Grants Shortcut */}
                  <button
                    onClick={() => setActiveTab("credit_grants")}
                    className="p-3 sm:p-4 bg-card border border-border rounded-lg hover:bg-secondary/50 hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-xs sm:text-sm">Credit Grants</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      View credit grants and bonuses
                    </p>
                  </button>

                  {/* Billing History Shortcut */}
                  <button
                    onClick={() => setActiveTab("history")}
                    className="p-3 sm:p-4 bg-card border border-border rounded-lg hover:bg-secondary/50 hover:border-primary/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <History className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      </div>
                      <span className="font-semibold text-xs sm:text-sm">Billing History</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      View payment history and invoices
                    </p>
                  </button>
                </div>
              </div>

            </TabsContent>

            <TabsContent value="conversation_history" className="space-y-4 sm:space-y-6">
              {/* Conversation Spending Section */}
              <div>
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Conversation Spending
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">See which conversations spent credits</p>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  {loadingTransactions ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mb-3 sm:mb-4" />
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Loading conversation spending...</p>
                    </div>
                  ) : creditTransactions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
                      <div className="p-3 sm:p-4 bg-secondary/50 rounded-full mb-3 sm:mb-4">
                        <Phone className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm sm:text-base md:text-lg font-medium text-foreground mb-2">No conversation spending</p>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground text-center max-w-md">
                        Conversation costs will appear here once you have completed calls.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {creditTransactions.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="p-3 sm:p-4 md:p-6 hover:bg-secondary/30 transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-3 sm:gap-4">
                            <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
                              <div className="p-2 sm:p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors flex-shrink-0">
                                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                                  <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                                    ${transaction.amount_dollars.toFixed(4)}
                                  </p>
                                  {transaction.agent_name && (
                                    <Badge variant="outline" className="text-xs">
                                      {transaction.agent_name}
                                    </Badge>
                                  )}
                                  {transaction.llm_model_name && (
                                    <Badge variant="secondary" className="text-xs">
                                      {transaction.llm_model_name}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-2">
                                  {transaction.duration_seconds && (
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                      <span>{Math.floor(transaction.duration_seconds / 60)}:{(transaction.duration_seconds % 60).toString().padStart(2, '0')}</span>
                                    </div>
                                  )}
                                  {transaction.message_count !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                      <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                      <span>{transaction.message_count} messages</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    <span className="break-words">{format(new Date(transaction.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                                  </div>
                                </div>

                                {/* Cost Breakdown */}
                                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50">
                                  <p className="text-xs font-medium text-muted-foreground mb-2">Cost Breakdown:</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 sm:gap-2 text-xs">
                                    {(() => {
                                      const hosting = Number(transaction.cost_breakdown?.hosting || 0);
                                      return hosting > 0 && (
                                        <div className="bg-secondary/30 rounded px-2 py-1">
                                          <span className="text-muted-foreground">Hosting:</span>
                                          <span className="font-medium ml-1">${hosting.toFixed(4)}</span>
                                        </div>
                                      );
                                    })()}
                                    {(() => {
                                      const transport = Number(transaction.cost_breakdown?.transport || 0);
                                      return transport > 0 && (
                                        <div className="bg-secondary/30 rounded px-2 py-1">
                                          <span className="text-muted-foreground">Transport:</span>
                                          <span className="font-medium ml-1">${transport.toFixed(4)}</span>
                                        </div>
                                      );
                                    })()}
                                    {(() => {
                                      const tts = Number(transaction.cost_breakdown?.tts || 0);
                                      return tts > 0 && (
                                        <div className="bg-secondary/30 rounded px-2 py-1">
                                          <span className="text-muted-foreground">TTS:</span>
                                          <span className="font-medium ml-1">${tts.toFixed(4)}</span>
                                        </div>
                                      );
                                    })()}
                                    {(() => {
                                      const stt = Number(transaction.cost_breakdown?.stt || 0);
                                      return stt > 0 && (
                                        <div className="bg-secondary/30 rounded px-2 py-1">
                                          <span className="text-muted-foreground">STT:</span>
                                          <span className="font-medium ml-1">${stt.toFixed(4)}</span>
                                        </div>
                                      );
                                    })()}
                                    {(() => {
                                      const llm = Number(transaction.cost_breakdown?.llm || 0);
                                      return llm > 0 && (
                                        <div className="bg-secondary/30 rounded px-2 py-1">
                                          <span className="text-muted-foreground">LLM:</span>
                                          <span className="font-medium ml-1">${llm.toFixed(4)}</span>
                                        </div>
                                      );
                                    })()}
                                  </div>
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
            </TabsContent>

            <TabsContent value="payment_methods" className="space-y-6">
              <PaymentMethodsList
                onPaymentMethodAdded={() => {
                  fetchAutoRechargeSettings();
                }}
              />
            </TabsContent>

            <TabsContent value="credit_grants" className="space-y-6">
              <CreditGrantsTable />
            </TabsContent>

            <TabsContent value="history" className="space-y-4 sm:space-y-6">
              {/* Payment History Section */}
              <div>
                <div className="mb-3 sm:mb-4 md:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold flex items-center gap-2">
                    <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Payment History
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">View all your credit purchases</p>
                </div>

                <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                  {loadingPayments ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
                      <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary mb-3 sm:mb-4" />
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground">Loading payment history...</p>
                    </div>
                  ) : payments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
                      <div className="p-3 sm:p-4 bg-secondary/50 rounded-full mb-3 sm:mb-4">
                        <History className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                      </div>
                      <p className="text-sm sm:text-base md:text-lg font-medium text-foreground mb-2">No payment history</p>
                      <p className="text-xs sm:text-sm md:text-base text-muted-foreground text-center max-w-md mb-4 sm:mb-6">
                        Credit purchases will appear here once you make your first purchase.
                      </p>
                      <Button
                        variant="default"
                        onClick={() => setShowPaymentMethodModal(true)}
                        className="text-xs sm:text-sm"
                      >
                        <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        Buy Credits
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="p-3 sm:p-4 md:p-6 hover:bg-secondary/30 transition-colors group"
                        >
                          <div className="flex items-center justify-between gap-3 sm:gap-4">
                            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                              <div className="p-2 sm:p-2.5 bg-secondary/50 rounded-lg group-hover:bg-secondary/70 transition-colors flex-shrink-0">
                                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 sm:gap-3 mb-1 flex-wrap">
                                  <p className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                                    ${payment.amount_dollars.toFixed(2)}
                                  </p>
                                  <Badge
                                    variant={getStatusBadgeVariant(payment.status)}
                                    className="text-xs"
                                  >
                                    {getStatusLabel(payment.status)}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  <span className="break-words">{format(new Date(payment.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
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
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <Dialog open={showContactSalesModal} onOpenChange={setShowContactSalesModal}>
        <DialogContent className="max-w-7xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
          <div className="flex-1 overflow-hidden min-h-0">
            <iframe
              src="https://cal.com/voiceabledev/30min?overlayCalendar=true"
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

      <AutoRechargeModal
        open={showAutoRechargeModal}
        onOpenChange={setShowAutoRechargeModal}
        onSuccess={() => {
          fetchAutoRechargeSettings();
          fetchCreditBalance();
        }}
      />
    </div>
  );
}
