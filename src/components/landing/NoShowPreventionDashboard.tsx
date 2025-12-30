import { Lightbulb, TrendingDown, DollarSign, Calendar, Target, Clock } from "lucide-react";

interface NoShowPreventionDashboardProps {
  noShowRate?: number;
  previousRate?: number;
  appointmentsSaved?: number;
  revenueProtected?: number;
  earlyReschedules?: number;
  avgAppointmentValue?: number;
  monthlyAppointments?: number;
  timingAnalysis?: string;
  costImpact?: {
    monthlyRevenueSaved?: number;
    agentCost?: number;
    netGain?: number;
  };
  aiInsight?: string;
}

export function NoShowPreventionDashboard({
  noShowRate = 6,
  previousRate = 20,
  appointmentsSaved = 34,
  revenueProtected = 7480,
  earlyReschedules = 23,
  avgAppointmentValue = 220,
  monthlyAppointments = 200,
  timingAnalysis = "83% of reschedules happen when you confirm at 48hrs vs 24hrs. Earlier confirmation = more time to refill = more revenue saved.",
  costImpact = {
    monthlyRevenueSaved: 7480,
    agentCost: 380,
    netGain: 7100,
  },
  aiInsight = "Tuesday 2pm slots have 31% no-show rate. Friday appointments have 18%. Recommend double-confirmation for Tuesdays.",
}: NoShowPreventionDashboardProps) {
  const rateChange = previousRate - noShowRate;

  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
          See Exactly What You're Saving
        </h2>
        <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
          Real-time tracking of no-show prevention and revenue protection
        </p>
        
        <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border mt-12">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">This Month's Performance</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-muted-foreground">No-Show Rate</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600">
                  {noShowRate}% <span className="text-sm text-emerald-500">↓{rateChange} pts (was {previousRate}%)</span>
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Appointments Saved</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {appointmentsSaved} <span className="text-sm text-blue-500">kept or rescheduled</span>
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-violet-600" />
                  <p className="text-sm text-muted-foreground">Revenue Protected</p>
                </div>
                <p className="text-3xl font-bold text-violet-600">
                  ${revenueProtected.toLocaleString()}
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-muted-foreground">Early Reschedules</p>
                </div>
                <p className="text-3xl font-bold text-amber-600">
                  {earlyReschedules} <span className="text-sm text-amber-500">(48hr+ notice)</span>
                </p>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 mb-6">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">Timing Analysis:</p>
                  <p className="text-foreground">{timingAnalysis}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 mb-6">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-2">Cost Impact:</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Average appointment value:</p>
                      <p className="text-xl font-bold text-foreground">${avgAppointmentValue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly appointments:</p>
                      <p className="text-xl font-bold text-foreground">{monthlyAppointments}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">No-shows prevented:</p>
                      <p className="text-xl font-bold text-foreground">{appointmentsSaved}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800 grid md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly revenue saved:</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${costImpact.monthlyRevenueSaved?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Agent cost:</p>
                      <p className="text-xl font-bold text-foreground">${costImpact.agentCost}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net gain:</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        ${costImpact.netGain?.toLocaleString()}/month
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">AI Insight:</p>
                  <p className="text-foreground">"{aiInsight}"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Every agent includes:</p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "Real-time no-show rate tracking",
                "Revenue saved vs. cost analysis",
                "Early reschedule metrics",
                "Slot fill rate after cancellations",
                "Prove ROI to your CFO instantly"
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

