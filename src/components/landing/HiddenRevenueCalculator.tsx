import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { DollarSign, TrendingUp, Target } from "lucide-react";

export function HiddenRevenueCalculator() {
  const [oldLeads, setOldLeads] = useState(3000);
  const [costPerLead, setCostPerLead] = useState(150);
  const [avgDealValue, setAvgDealValue] = useState(8000);
  
  // Calculations
  const sunkCost = oldLeads * costPerLead;
  const revivalRate = 18; // Average 18% revival rate
  const readyToBuyLeads = Math.round(oldLeads * (revivalRate / 100));
  const potentialPipeline = readyToBuyLeads * avgDealValue;
  const revivalCostPerLead = 15; // $15 per revival
  const totalRevivalCost = readyToBuyLeads * revivalCostPerLead;
  const hiddenRevenue = potentialPipeline - totalRevivalCost;
  const roi = sunkCost > 0 ? ((hiddenRevenue / sunkCost) * 100).toFixed(0) : 0;

  return (
    <section className="py-24 px-6 bg-card/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
          Calculate Your Hidden Revenue
        </h2>
        <p className="text-xl text-muted-foreground mb-12 text-center max-w-2xl mx-auto">
          See how much pipeline is sitting in your CRM right now
        </p>
        
        <div className="bg-background rounded-3xl p-8 md:p-12 shadow-2xl border border-border mt-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="oldLeads" className="text-foreground mb-2 block">
                  Total leads in CRM older than 6 months
                </Label>
                <Input
                  id="oldLeads"
                  type="number"
                  value={oldLeads}
                  onChange={(e) => setOldLeads(Number(e.target.value))}
                  className="text-lg"
                  min="1"
                />
              </div>
              
              <div>
                <Label htmlFor="costPerLead" className="text-foreground mb-2 block">
                  Original cost per lead (estimate)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="costPerLead"
                    type="number"
                    value={costPerLead}
                    onChange={(e) => setCostPerLead(Number(e.target.value))}
                    className="text-lg pl-8"
                    min="1"
                  />
                </div>
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
            </div>
            
            {/* Results */}
            <div className="space-y-6">
              <div className="bg-primary/5 rounded-xl p-6 border border-primary/20">
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Hidden Opportunity:</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Sunk acquisition cost (already spent):</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${sunkCost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Estimated ready-to-buy leads (18%):</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {readyToBuyLeads.toLocaleString()} leads
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Potential pipeline value:</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${potentialPipeline.toLocaleString()}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-1">Revival cost:</p>
                    <p className="text-xl font-bold text-foreground">
                      ${totalRevivalCost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Hidden revenue:</p>
                    <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${hiddenRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">You're sitting on</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  ${potentialPipeline.toLocaleString()}
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">in pipeline you've already paid for</p>
                <p className="text-xs text-muted-foreground mt-3">
                  ROI: {roi}x on money already spent
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-8" asChild>
              <Link href="/sign-up">
                Unlock Hidden Revenue
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link href="/sign-up">
                Start Free Trial
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

