import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  CreditCard,
  Info,
  Pencil
} from "lucide-react";
import { PurchaseCreditsModal } from "@/components/PurchaseCreditsModal";

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hipaaEnabled, setHipaaEnabled] = useState(false);
  const [concurrency, setConcurrency] = useState("0");
  const [dataRetention, setDataRetention] = useState(false);
  const [autoReload, setAutoReload] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [currentBalance] = useState(10);

  useEffect(() => {
    // Check if we should open the modal from URL parameter
    if (searchParams.get("openModal") === "true") {
      setShowPurchaseModal(true);
      // Remove the query parameter from URL
      searchParams.delete("openModal");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="max-w-6xl">
      {/* Plans Header */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-semibold mb-2">Plans</h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Select a plan for your organization. <span className="font-semibold text-foreground">Bundled minutes</span> include the cost of every provider used during a call (LLM, TTS, STT, etc.). <span className="font-semibold text-foreground">Overage cost</span> applies when you exceed your bundled minutes.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Usage Based Plan */}
        <div className="bg-secondary/50 border border-accent rounded-lg p-4 md:p-6">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Usage Based</p>
          <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Pay as you go</h3>
          
          <div className="space-y-2 text-xs md:text-sm mb-4 md:mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bundled minutes:</span>
              <span>-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bundled minutes overage cost:</span>
              <span>-</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concurrency included:</span>
              <span>10</span>
            </div>
          </div>

          <p className="text-accent font-medium text-sm md:text-base">Current Plan</p>
        </div>

        {/* Enterprise Plan */}
        <div className="bg-secondary/30 border border-border rounded-lg p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3 md:mb-4">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Enterprise</p>
              <h3 className="text-xl md:text-2xl font-semibold">Custom <span className="text-xs md:text-sm font-normal text-muted-foreground">/annual contract</span></h3>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">Starting at 600,000/year</p>
          </div>
          
          <div className="space-y-2 text-xs md:text-sm mb-4 md:mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bundled minutes:</span>
              <span>Custom</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bundled minutes overage cost:</span>
              <span>Custom</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concurrency included:</span>
              <span>Custom</span>
            </div>
          </div>

          <Button variant="accent" className="w-full text-xs md:text-sm">
            Contact Sales
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Add-ons */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">Add-ons</h3>
          <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6">Configure add-ons and supercharge your experience</p>

          <div className="space-y-3 md:space-y-4">
            {/* HIPAA Compliance */}
            <div className="bg-secondary/30 border border-border rounded-lg p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm md:text-base">Enable HIPAA Compliance</span>
                  <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                </div>
                <Switch checked={hipaaEnabled} onCheckedChange={setHipaaEnabled} />
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-accent">● Bills monthly</span>
                <span className="text-muted-foreground">+ $1000/mo</span>
              </div>
              
              {hipaaEnabled && (
                <div className="mt-3 md:mt-4 space-y-2 md:space-y-3">
                  <Input placeholder="Recipient Name" className="bg-secondary/50 h-9 md:h-10 text-sm" />
                  <Input placeholder="Recipient Organization" className="bg-secondary/50 h-9 md:h-10 text-sm" />
                </div>
              )}
            </div>

            {/* Reserved Concurrency */}
            <div className="bg-secondary/30 border border-border rounded-lg p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm md:text-base">Reserved Concurrency (Call Lines)</span>
                  <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                </div>
                <Input 
                  type="number" 
                  value={concurrency}
                  onChange={(e) => setConcurrency(e.target.value)}
                  className="w-20 bg-secondary/50 text-center h-9 md:h-10 text-sm"
                />
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-accent">● Bills monthly</span>
                <span className="text-muted-foreground">+ $10/mo each</span>
              </div>
            </div>

            {/* Data Retention */}
            <div className="bg-secondary/30 border border-border rounded-lg p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm md:text-base">60-day Call and Chat Data Retention</span>
                  <Info className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                </div>
                <Switch checked={dataRetention} onCheckedChange={setDataRetention} />
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-accent">● Bills monthly</span>
                <span className="text-muted-foreground">+ $1000/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">Payment Method</h3>
          <p className="text-muted-foreground text-xs md:text-sm mb-4 md:mb-6">Enter your card details</p>

          <div className="space-y-3 md:space-y-4">
            <div className="space-y-2">
              <Label className="text-sm md:text-base">Billing Email</Label>
              <div className="relative">
                <Input 
                  value="vbrazo@gmail.com" 
                  className="bg-secondary/50 pr-10 h-9 md:h-10 text-sm"
                  readOnly
                />
                <Pencil className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm md:text-base">Payment Method</Label>
              <div className="flex items-center gap-2 bg-secondary/50 border border-border rounded-md px-2 md:px-3 py-2">
                <div className="w-7 h-4 md:w-8 md:h-5 bg-blue-600 rounded flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
                </div>
                <span className="text-xs md:text-sm text-muted-foreground truncate">Número do cartão</span>
                <div className="ml-auto flex items-center gap-1 md:gap-2 flex-shrink-0">
                  <span className="text-xs bg-accent/20 text-accent px-1.5 md:px-2 py-0.5 rounded">link</span>
                  <span className="text-xs md:text-sm text-foreground">●●●● 5695</span>
                  <Pencil className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm md:text-base">Enable Auto Reload</Label>
                <Switch checked={autoReload} onCheckedChange={setAutoReload} />
              </div>
            </div>

            {autoReload && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm md:text-base">Amount to reload</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input 
                      defaultValue="10" 
                      className="bg-secondary/50 pl-7 h-9 md:h-10 text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm md:text-base">When threshold reaches</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input 
                      defaultValue="10" 
                      className="bg-secondary/50 pl-7 h-9 md:h-10 text-sm"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <PurchaseCreditsModal
        open={showPurchaseModal}
        onOpenChange={setShowPurchaseModal}
        currentBalance={currentBalance}
      />
    </div>
  );
}
