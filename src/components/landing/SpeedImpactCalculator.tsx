import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { TrendingDown, TrendingUp, Clock } from "lucide-react";

export function SpeedImpactCalculator() {
  const [monthlyLeads, setMonthlyLeads] = useState(100);
  const [currentRate, setCurrentRate] = useState(23);
  const [avgDealValue, setAvgDealValue] = useState(5000);
  const [currentResponseTime, setCurrentResponseTime] = useState(24);
  
  // Calculations
  const currentMeetings = Math.round(monthlyLeads * (currentRate / 100));
  const currentPipeline = currentMeetings * avgDealValue;
  
  // With 60-sec response, assume 67% conversion (from research)
  const fastResponseRate = 67;
  const fastResponseMeetings = Math.round(monthlyLeads * (fastResponseRate / 100));
  const fastResponsePipeline = fastResponseMeetings * avgDealValue;
  
  const leadsGoingCold = monthlyLeads - currentMeetings;
  const lostPipeline = (fastResponseMeetings - currentMeetings) * avgDealValue;
  const additionalMeetings = fastResponseMeetings - currentMeetings;
  const additionalPipeline = fastResponsePipeline - currentPipeline;

  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
          Calculate Your Lost Pipeline
        </h2>
        
        <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border mt-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="leads" className="text-foreground mb-2 block">
                  Monthly new leads
                </Label>
                <Input
                  id="leads"
                  type="number"
                  value={monthlyLeads}
                  onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                  className="text-lg"
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="rate" className="text-foreground mb-2 block">
                  Current lead-to-meeting rate (%)
                </Label>
                <Input
                  id="rate"
                  type="number"
                  value={currentRate}
                  onChange={(e) => setCurrentRate(Number(e.target.value))}
                  className="text-lg"
                  min="0"
                  max="100"
                />
              </div>
              
              <div>
                <Label htmlFor="dealValue" className="text-foreground mb-2 block">
                  Average deal value
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="dealValue"
                    type="number"
                    value={avgDealValue}
                    onChange={(e) => setAvgDealValue(Number(e.target.value))}
                    className="text-lg pl-8"
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="responseTime" className="text-foreground mb-2 block">
                  Current response time (hours)
                </Label>
                <Input
                  id="responseTime"
                  type="number"
                  value={currentResponseTime}
                  onChange={(e) => setCurrentResponseTime(Number(e.target.value))}
                  className="text-lg"
                  min="0"
                />
              </div>
            </div>
            
            {/* Results */}
            <div className="space-y-6">
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Results:</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Leads going cold:</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {leadsGoingCold} per month
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Lost pipeline:</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${lostPipeline.toLocaleString()} per month
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">With 60-sec response:</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      +{additionalMeetings} qualified meetings
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Additional pipeline:</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${additionalPipeline.toLocaleString()}/month
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="font-semibold text-red-600 dark:text-red-400">Speed is leaving</p>
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${lostPipeline.toLocaleString()}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">in pipeline on the table</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8" asChild>
              <Link href="/sign-up" rel="nofollow">
                Stop Losing Leads
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link href="/sign-up" rel="nofollow">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

