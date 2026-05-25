import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { DollarSign, TrendingDown, AlertCircle } from "lucide-react";

export function NoShowCostCalculator() {
  const [monthlyAppointments, setMonthlyAppointments] = useState(200);
  const [avgAppointmentValue, setAvgAppointmentValue] = useState(150);
  const [currentNoShowRate, setCurrentNoShowRate] = useState(20);
  
  // Calculations
  const monthlyNoShows = Math.round(monthlyAppointments * (currentNoShowRate / 100));
  const monthlyLostRevenue = monthlyNoShows * avgAppointmentValue;
  const annualCost = monthlyLostRevenue * 12;
  
  // With 60-80% reduction (using 70% average)
  const reductionRate = 70;
  const newNoShowRate = currentNoShowRate * (1 - reductionRate / 100);
  const newMonthlyNoShows = Math.round(monthlyAppointments * (newNoShowRate / 100));
  const revenueSavedMonthly = (monthlyNoShows - newMonthlyNoShows) * avgAppointmentValue;
  const annualSavings = revenueSavedMonthly * 12;
  
  const agentCost = 380;
  const agentCostAnnual = agentCost * 12;
  const netAnnualSavings = annualSavings - agentCostAnnual;

  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
          Calculate Your Annual No-Show Losses
        </h2>
        <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
          See exactly how much revenue you're losing to no-shows
        </p>
        
        <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border mt-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="appointments" className="text-foreground mb-2 block">
                  Monthly appointments
                </Label>
                <Input
                  id="appointments"
                  type="number"
                  value={monthlyAppointments}
                  onChange={(e) => setMonthlyAppointments(Number(e.target.value))}
                  className="text-lg"
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="value" className="text-foreground mb-2 block">
                  Average appointment value
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="value"
                    type="number"
                    value={avgAppointmentValue}
                    onChange={(e) => setAvgAppointmentValue(Number(e.target.value))}
                    className="text-lg pl-8"
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="rate" className="text-foreground mb-2 block">
                  Current no-show rate (%)
                </Label>
                <Input
                  id="rate"
                  type="number"
                  value={currentNoShowRate}
                  onChange={(e) => setCurrentNoShowRate(Number(e.target.value))}
                  className="text-lg"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            {/* Results */}
            <div className="space-y-6">
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Current Losses:</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly no-shows:</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {monthlyNoShows} appointments
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly lost revenue:</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${monthlyLostRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Annual cost:</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      ${annualCost.toLocaleString()}/year
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                <h3 className="text-lg font-semibold text-foreground mb-4">With 60-80% Reduction:</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">New no-show rate:</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {newNoShowRate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Revenue saved monthly:</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${revenueSavedMonthly.toLocaleString()}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-muted-foreground mb-1">Annual savings:</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${annualSavings.toLocaleString()}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm text-muted-foreground mb-1">Agent cost:</p>
                    <p className="text-xl font-bold text-foreground">
                      ${agentCostAnnual.toLocaleString()}/year
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Net annual savings:</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${netAnnualSavings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="font-semibold text-red-600 dark:text-red-400">You're losing</p>
                </div>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  ${annualCost.toLocaleString()}/year
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">to no-shows</p>
                <p className="text-xs text-muted-foreground mt-3">
                  Fix it for ${agentCostAnnual.toLocaleString()}/year
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8" asChild>
              <Link href="/sign-up" rel="nofollow">
                Stop Losing Revenue
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

