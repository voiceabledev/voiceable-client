import { useState, useEffect } from "react";
import { Loader2, Sparkles, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { creditGrantsApi, CreditGrant } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

export function CreditGrantsTable() {
  const { toast } = useToast();
  const [grants, setGrants] = useState<CreditGrant[]>([]);
  const [totals, setTotals] = useState<{
    granted_cents: number;
    remaining_cents: number;
    used_cents: number;
    granted_dollars: number;
    remaining_dollars: number;
    used_dollars: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCreditGrants();
  }, []);

  const fetchCreditGrants = async () => {
    setLoading(true);
    try {
      const response = await creditGrantsApi.list();
      if (response.data) {
        setGrants(response.data.grants);
        setTotals(response.data.totals);
      }
    } catch (error) {
      console.error("Error fetching credit grants:", error);
      toast({
        title: "Error",
        description: "Failed to load credit grants.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStateBadge = (state: string, expiresAt: string | null) => {
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return (
        <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
          Expired
        </Badge>
      );
    }

    switch (state) {
      case "available":
        return (
          <Badge variant="default" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
            Available
          </Badge>
        );
      case "used":
        return (
          <Badge variant="outline" className="text-xs bg-muted text-muted-foreground">
            Used
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {state}
          </Badge>
        );
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "signup_bonus":
        return "Signup Bonus";
      case "manual_grant":
        return "Manual Grant";
      default:
        return "Other";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {totals && (
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">Total Credit Grants</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Progress 
                  value={totals.granted_cents > 0 ? (totals.remaining_cents / totals.granted_cents) * 100 : 0} 
                  className="h-2"
                />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  ${totals.remaining_dollars.toFixed(2)} / ${totals.granted_dollars.toFixed(2)} USD
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totals.granted_cents > 0 
                    ? `${((totals.remaining_cents / totals.granted_cents) * 100).toFixed(1)}% remaining`
                    : 'No grants'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {grants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 border border-border rounded-lg bg-secondary/30">
          <div className="p-4 bg-secondary/50 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-base font-medium text-foreground mb-2">No credit grants</p>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Credit grants will appear here when you receive promotional credits or bonuses.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {grants.map((grant) => {
              const usagePercent = grant.original_amount_cents > 0
                ? ((grant.original_amount_cents - grant.remaining_amount_cents) / grant.original_amount_cents) * 100
                : 0;
              const isExpired = grant.expires_at && new Date(grant.expires_at) < new Date();

              return (
                <div
                  key={grant.id}
                  className="p-4 md:p-6 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {getStateBadge(grant.state, grant.expires_at)}
                        <Badge variant="secondary" className="text-xs">
                          {getSourceLabel(grant.source)}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Received: {format(new Date(grant.received_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        {grant.expires_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className={`text-sm ${isExpired ? 'text-destructive' : 'text-muted-foreground'}`}>
                              Expires: {format(new Date(grant.expires_at), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Balance:</span>
                          <span className="font-semibold text-foreground">
                            ${grant.remaining_amount_dollars.toFixed(2)} / ${grant.original_amount_dollars.toFixed(2)}
                          </span>
                        </div>
                        <Progress value={usagePercent} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          {usagePercent.toFixed(1)}% used
                        </p>
                      </div>

                      {grant.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          {grant.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

