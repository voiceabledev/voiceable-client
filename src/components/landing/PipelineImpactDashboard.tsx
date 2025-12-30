import { Lightbulb, TrendingUp, DollarSign, Clock, Target } from "lucide-react";

interface PipelineImpactDashboardProps {
  meetings?: number;
  meetingsChange?: string;
  pipeline?: number;
  pipelineChange?: string;
  responseTime?: string;
  conversionRate?: string;
  previousRate?: string;
  speedAnalysis?: string;
  aiInsight?: string;
}

export function PipelineImpactDashboard({
  meetings = 124,
  meetingsChange = "↑67%",
  pipeline = 487000,
  pipelineChange = "↑89%",
  responseTime = "38 seconds",
  conversionRate = "67%",
  previousRate = "23%",
  speedAnalysis = "Leads contacted in < 60 sec convert at 67%. Leads contacted after 1 hour convert at 12%.",
  aiInsight = "43% of your high-value leads come in after 6pm. You were missing them entirely before.",
}: PipelineImpactDashboardProps) {
  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
          See Exactly What Speed Does to Your Pipeline
        </h2>
        
        <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border mt-12">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">This Month's Performance</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-muted-foreground">Qualified Meetings Booked</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600">
                  {meetings} <span className="text-sm text-emerald-500">{meetingsChange}</span>
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Pipeline Generated</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  ${(pipeline / 1000).toFixed(0)}k <span className="text-sm text-blue-500">{pipelineChange}</span>
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-violet-600" />
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <p className="text-3xl font-bold text-violet-600">{responseTime}</p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-muted-foreground">Lead-to-Meeting Rate</p>
                </div>
                <p className="text-3xl font-bold text-amber-600">
                  {conversionRate} <span className="text-sm text-amber-500">(was {previousRate})</span>
                </p>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 mb-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">Speed Analysis:</p>
                  <p className="text-foreground">{speedAnalysis}</p>
                  <p className="text-sm text-muted-foreground mt-2">Speed = $180k additional pipeline/month</p>
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
                "Real-time qualification tracking",
                "Response time analytics",
                "Lead-to-meeting conversion rate",
                "Pipeline value attribution",
                "Compare before/after performance"
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

