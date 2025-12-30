import { Lightbulb, TrendingUp, DollarSign, Target, Users, Calendar } from "lucide-react";

interface RevenueRecoveryDashboardProps {
  leadsReengaged?: number;
  interestIdentified?: number;
  interestRate?: string;
  meetingsBooked?: number;
  pipelineResurrected?: number;
  revivalAnalysis?: string;
  costPerRevival?: number;
  costPerNewLead?: number;
  aiInsight?: string;
}

export function RevenueRecoveryDashboard({
  leadsReengaged = 847,
  interestIdentified = 156,
  interestRate = "18.4%",
  meetingsBooked = 67,
  pipelineResurrected = 340000,
  revivalAnalysis = "Your Q2 2024 leads have 23% revival rate — highest of any segment.",
  costPerRevival = 15,
  costPerNewLead = 150,
  aiInsight = "Leads from 6-9 months ago have highest revival rate (22%)",
}: RevenueRecoveryDashboardProps) {
  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
          Revenue Recovery Dashboard
        </h2>
        <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
          See exactly how much pipeline you're recovering from leads you already paid for
        </p>
        
        <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border mt-12">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">This Month's Recovery</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Leads Re-Engaged</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {leadsReengaged.toLocaleString()}
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-muted-foreground">Interest Identified</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600">
                  {interestIdentified} <span className="text-sm text-emerald-500">({interestRate})</span>
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-violet-600" />
                  <p className="text-sm text-muted-foreground">Meetings Booked</p>
                </div>
                <p className="text-3xl font-bold text-violet-600">
                  {meetingsBooked}
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-muted-foreground">Pipeline Resurrected</p>
                </div>
                <p className="text-3xl font-bold text-amber-600">
                  ${(pipelineResurrected / 1000).toFixed(0)}k
                </p>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 mb-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">Revival Analysis:</p>
                  <p className="text-foreground">{revivalAnalysis}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 mb-6">
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-2">Cost Comparison:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">New acquisition cost:</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">${costPerNewLead}/lead</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revival cost:</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">${costPerRevival}/lead</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground mt-3">
                    <strong>10x cheaper</strong> to revive existing leads than acquire new ones
                  </p>
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
                "Smart segmentation & prioritization",
                "Respectful re-engagement conversations",
                "Interest signal detection",
                "Automatic CRM status updates",
                "Revival rate tracking",
                "Cost-per-revival analytics",
                "Pipeline value attribution",
                "Segment performance analysis"
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

