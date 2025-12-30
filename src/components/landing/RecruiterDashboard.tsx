import { Lightbulb, TrendingUp, Users, Calendar, Target, Clock, Phone } from "lucide-react";

interface RecruiterDashboardProps {
  candidatesScreened?: number;
  completedScreens?: number;
  qualifiedForInterview?: number;
  interviewsBooked?: number;
  recruiterHoursSaved?: number;
  screeningInsights?: string[];
  aiInsight?: string;
}

export function RecruiterDashboard({
  candidatesScreened = 184,
  completedScreens = 147,
  qualifiedForInterview = 42,
  interviewsBooked = 36,
  recruiterHoursSaved = 27,
  screeningInsights = [
    "Candidates contacted within 2 hours had a 78% completion rate",
    "Drop-off increased by 41% after 24 hours",
    "Role A questions predict interview success better than Role B"
  ],
  aiInsight = "Candidates contacted within 2 hours had a 78% completion rate vs 34% after 24 hours.",
}: RecruiterDashboardProps) {
  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
          See Exactly Where Time Is Saved
        </h2>
        <p className="text-xl text-muted-foreground mb-12 text-center max-w-3xl mx-auto">
          Real-time tracking of screening activity and recruiter time savings
        </p>
        
        <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border mt-12">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">This Month's Activity</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-muted-foreground">Candidates Screened</p>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {candidatesScreened}
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm text-muted-foreground">Completed Phone Screens</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600">
                  {completedScreens}
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-violet-600" />
                  <p className="text-sm text-muted-foreground">Qualified for Interview</p>
                </div>
                <p className="text-3xl font-bold text-violet-600">
                  {qualifiedForInterview}
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <p className="text-sm text-muted-foreground">Interviews Booked Automatically</p>
                </div>
                <p className="text-3xl font-bold text-amber-600">
                  {interviewsBooked}
                </p>
              </div>
              <div className="bg-card rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <p className="text-sm text-muted-foreground">Recruiter Hours Saved</p>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {recruiterHoursSaved}
                </p>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/20 mb-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-2">Screening Insights:</p>
                  <ul className="space-y-2">
                    {screeningInsights.map((insight, index) => (
                      <li key={index} className="text-foreground">
                        • {insight}
                      </li>
                    ))}
                  </ul>
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
                "Screening completion rates",
                "Qualification ratios",
                "Time-to-screen metrics",
                "Interview conversion tracking",
                "ATS-friendly summaries"
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

