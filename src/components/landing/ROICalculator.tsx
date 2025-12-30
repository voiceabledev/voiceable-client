import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { Calculator, TrendingDown, DollarSign } from "lucide-react";

export function ROICalculator() {
  const [monthlyCalls, setMonthlyCalls] = useState(200);
  const [missRate, setMissRate] = useState(35);
  const [avgBookingValue, setAvgBookingValue] = useState(200);
  
  const missedCalls = Math.round(monthlyCalls * (missRate / 100));
  const lostRevenue = missedCalls * avgBookingValue;
  const aiCost = 380;
  const netGain = lostRevenue - aiCost;

  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
          Calculate Your Lost Revenue
        </h2>
        
        <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border mt-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="calls" className="text-foreground mb-2 block">
                  Monthly incoming calls
                </Label>
                <Input
                  id="calls"
                  type="number"
                  value={monthlyCalls}
                  onChange={(e) => setMonthlyCalls(Number(e.target.value))}
                  className="text-lg"
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="missRate" className="text-foreground mb-2 block">
                  % calls you miss (average is 30-40%)
                </Label>
                <div className="space-y-2">
                  <Input
                    id="missRate"
                    type="number"
                    value={missRate}
                    onChange={(e) => setMissRate(Number(e.target.value))}
                    className="text-lg"
                    min="0"
                    max="100"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={missRate}
                    onChange={(e) => setMissRate(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="bookingValue" className="text-foreground mb-2 block">
                  Average booking value
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="bookingValue"
                    type="number"
                    value={avgBookingValue}
                    onChange={(e) => setAvgBookingValue(Number(e.target.value))}
                    className="text-lg pl-8"
                    min="1"
                  />
                </div>
              </div>
            </div>
            
            {/* Results */}
            <div className="space-y-6">
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Results:</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Calls you're missing:</p>
                    <p className="text-2xl font-bold text-foreground">{missedCalls} per month</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Lost revenue:</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${lostRevenue.toLocaleString()} per month
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">AI receptionist cost:</p>
                    <p className="text-2xl font-bold text-foreground">${aiCost}/month</p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Net gain:</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${netGain.toLocaleString()}/month
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="font-semibold text-red-600 dark:text-red-400">You're leaving</p>
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  ${lostRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">on the table every month</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8" asChild>
              <Link to="/sign-up">
                Stop Losing Revenue
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link to="/sign-up">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

