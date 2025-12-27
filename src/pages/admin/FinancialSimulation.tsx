import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calculator } from "lucide-react";
import { FinancialSimulationRunner } from "@/utils/runFinancialSimulation";

export default function AdminFinancialSimulation() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin")}
            className="flex-shrink-0 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
              <Calculator className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              Financial Simulation
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Project revenue, costs, and profitability based on user growth and usage patterns
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <FinancialSimulationRunner hideHeader={true} />
        </div>
      </div>
    </div>
  );
}

