import { Lightbulb, TrendingUp, DollarSign, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface RevenueCaptureDashboardProps {
  revenue?: number;
  revenueChange?: string;
  afterHoursBookings?: number;
  missedCallRecovery?: string;
  costSavings?: string;
  aiInsight?: string;
  aiInsightImpact?: string;
}

export function RevenueCaptureDashboard({
  revenue = 18400,
  revenueChange = "↑34%",
  afterHoursBookings = 67,
  missedCallRecovery = "89%",
  costSavings = "$2,640/month",
  aiInsight = "43% of bookings happen after 5pm. You were missing $7,800/month before.",
  aiInsightImpact,
}: RevenueCaptureDashboardProps) {
  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
          See Exactly What You're Capturing
        </h2>
        
        <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
          Not vanity metrics. Real business impact.
        </p>

        <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">This Month's Performance</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-muted-foreground">Revenue Captured</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600">
                  ${revenue.toLocaleString()} <span className="text-sm text-emerald-500">{revenueChange}</span>
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-muted-foreground">After-Hours Bookings</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">{afterHoursBookings} appointments</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-violet-600" />
                  <p className="text-sm text-muted-foreground">Missed Call Recovery</p>
                </div>
                <p className="text-3xl font-bold text-violet-600">{missedCallRecovery} answered</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-muted-foreground">Cost vs. Human</p>
                </div>
                <p className="text-3xl font-bold text-amber-600">{costSavings}</p>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">AI Insight:</p>
                  <p className="text-foreground mb-2">"{aiInsight}"</p>
                  {aiInsightImpact && (
                    <p className="text-sm text-muted-foreground">{aiInsightImpact}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Every agent includes:</p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Real-time booking tracking",
                "Revenue captured vs. cost spent",
                "After-hours performance analysis",
                "Compare to your previous miss rate",
                "Prove ROI to your boss instantly"
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

