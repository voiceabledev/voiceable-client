import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { phoneNumbersApi, agentsApi, Agent, AvailablePhoneNumber } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Phone, Check, ShoppingCart, CheckCircle2, ArrowLeft, Globe, MapPin, MessageSquare, PhoneCall, Smartphone } from "lucide-react";

interface PhoneNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAgentId?: string;
}

export function PhoneNumberModal({ open, onOpenChange, defaultAgentId }: PhoneNumberModalProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [step, setStep] = useState<"account" | "assign">("account");
  const [accountNumbers, setAccountNumbers] = useState<AvailablePhoneNumber[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<AvailablePhoneNumber[]>([]);
  const [loadingAccountNumbers, setLoadingAccountNumbers] = useState(false);
  const [loadingNumbers, setLoadingNumbers] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<AvailablePhoneNumber | null>(null);
  const [label, setLabel] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("none");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [countryCode, setCountryCode] = useState("US");
  const [areaCode, setAreaCode] = useState("");

  useEffect(() => {
    if (open) {
      fetchAgents();
      fetchAccountNumbers();
      // Reset available numbers when modal opens
      setAvailableNumbers([]);
      // Set default agent if provided
      if (defaultAgentId) {
        setSelectedAgentId(defaultAgentId);
      }
    } else {
      // Reset state when modal closes
      setStep("account");
      setSelectedNumber(null);
      setLabel("");
      setSelectedAgentId(defaultAgentId || "none");
      setAreaCode("");
      setAccountNumbers([]);
      setAvailableNumbers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultAgentId]);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await agentsApi.list();
      if (response.data) {
        setAgents(response.data);
      }
    } catch (err) {
      toast({
        title: 'Error loading agents',
        description: err instanceof Error ? err.message : 'Failed to fetch agents',
        variant: 'destructive',
      });
    } finally {
      setLoadingAgents(false);
    }
  };

  const fetchAccountNumbers = async () => {
    setLoadingAccountNumbers(true);
    try {
      const response = await phoneNumbersApi.getAccountNumbers();
      if (response.data) {
        setAccountNumbers(response.data);
      }
    } catch (err) {
      console.warn('Failed to fetch account numbers:', err);
    } finally {
      setLoadingAccountNumbers(false);
    }
  };

  const fetchAvailableNumbers = async () => {
    setLoadingNumbers(true);
    try {
      const response = await phoneNumbersApi.getAvailable(countryCode, areaCode || undefined);
      if (response.data) {
        setAvailableNumbers(response.data);
      } else {
        setAvailableNumbers([]);
      }
    } catch (err: any) {
      console.error('Error fetching available numbers:', err);
      setAvailableNumbers([]);
      
      toast({
        title: 'Error loading available numbers',
        description: err instanceof Error ? err.message : 'Failed to fetch available phone numbers',
        variant: 'destructive',
      });
    } finally {
      setLoadingNumbers(false);
    }
  };

  const handleSearch = () => {
    fetchAvailableNumbers();
  };

  const handleSelectNumber = (number: AvailablePhoneNumber) => {
    setSelectedNumber(number);
    setStep("assign");
  };

  const handleAssign = async () => {
    if (!selectedNumber || !label.trim()) {
      toast({
        title: 'Error',
        description: 'Please select a number and provide a label.',
        variant: 'destructive',
      });
      return;
    }

    setAssigning(true);
    try {
      const params = {
        phone_number: selectedNumber.phone_number,
        label: label.trim(),
        provider: 'twilio' as const,
        agent_id: selectedAgentId !== "none" ? selectedAgentId : undefined,
      };

      const response = await phoneNumbersApi.create(params);
      
      if (response.data) {
        toast({
          title: 'Success',
          description: accountNumbers.some(n => n.phone_number === selectedNumber.phone_number)
            ? 'Phone number assigned successfully.'
            : 'Phone number purchased and assigned successfully.',
        });
        onOpenChange(false);
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.status?.message ||
                           (err instanceof Error ? err.message : 'Failed to assign phone number');

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  const handleBack = () => {
    if (step === "assign") {
      // Go back to account step
      setStep("account");
      setSelectedNumber(null);
      setLabel("");
    }
  };

  const isFromAccount = selectedNumber && accountNumbers.some(n => n.phone_number === selectedNumber.phone_number);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 space-y-2">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className={cn(
              "p-2.5 rounded-xl transition-all duration-300 shadow-sm",
              step === "account" ? "bg-primary/10" : "bg-green-500/10"
            )}>
              {step === "account" ? (
                <Phone className="h-5 w-5 text-primary" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              )}
            </div>
            {step === "account" ? "Add Phone Number" : "Assign Phone Number"}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {step === "account"
              ? "Choose from your existing numbers or search for new ones to purchase"
              : "Configure your phone number with a label and assign it to an agent"}
          </DialogDescription>
        </DialogHeader>

        <Separator />
        
        {step === "account" ? (
          <div className="flex flex-col gap-6 p-6">
            {/* Account Numbers Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Your Account Numbers</h3>
                  <p className="text-xs text-muted-foreground">
                    Available numbers from your Twilio account
                  </p>
                </div>
              </div>

              {loadingAccountNumbers ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-card animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted/50" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted/50 rounded w-32" />
                          <div className="h-3 bg-muted/30 rounded w-24" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : accountNumbers.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {accountNumbers.map((number, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectNumber(number)}
                      className={cn(
                        "w-full p-4 rounded-xl border transition-all duration-300 text-left group",
                        "bg-card hover:shadow-md hover:-translate-y-0.5",
                        selectedNumber?.phone_number === number.phone_number
                          ? "border-green-500/50 bg-green-500/5 shadow-sm"
                          : "border-border hover:border-green-500/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "p-2 rounded-lg transition-all duration-300 flex-shrink-0",
                            selectedNumber?.phone_number === number.phone_number
                              ? "bg-green-500/15"
                              : "bg-green-500/10 group-hover:bg-green-500/15"
                          )}>
                            <Phone className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base mb-1 tracking-tight">
                              {number.phone_number}
                            </div>
                            {number.friendly_name && (
                              <div className="text-sm text-muted-foreground mb-1">
                                {number.friendly_name}
                              </div>
                            )}
                            {number.region && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {number.region}
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20 flex-shrink-0">
                          In Account
                        </Badge>
                      </div>
                      {number.capabilities && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                          {number.capabilities.voice && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <PhoneCall className="h-3 w-3" />
                              Voice
                            </Badge>
                          )}
                          {number.capabilities.sms && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <MessageSquare className="h-3 w-3" />
                              SMS
                            </Badge>
                          )}
                          {number.capabilities.mms && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Smartphone className="h-3 w-3" />
                              MMS
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 px-4 rounded-xl bg-muted/20">
                  <Phone className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No numbers available in your account
                  </p>
                </div>
              )}

              <Separator className="my-2" />

              {/* Search Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <ShoppingCart className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Purchase New Number</h3>
                    <p className="text-xs text-muted-foreground">
                      Search for available phone numbers to buy
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        Country
                      </Label>
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="bg-background/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">🇺🇸 United States</SelectItem>
                          <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                          <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                          <SelectItem value="AU">🇦🇺 Australia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        Area Code (Optional)
                      </Label>
                      <Input
                        value={areaCode}
                        onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                        placeholder="e.g., 415"
                        className="bg-background/80"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSearch}
                    disabled={loadingNumbers}
                    className="w-full shadow-sm hover:shadow-md transition-all"
                    size="lg"
                  >
                    {loadingNumbers ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search Available Numbers
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Available Numbers List */}
              {loadingNumbers ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-xl border border-border bg-card animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted/50" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted/50 rounded w-32" />
                          <div className="h-3 bg-muted/30 rounded w-24" />
                        </div>
                        <div className="h-6 bg-muted/50 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : availableNumbers.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {availableNumbers.map((number, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectNumber(number)}
                      className={cn(
                        "w-full p-4 rounded-xl border transition-all duration-300 text-left group",
                        "bg-card hover:shadow-md hover:-translate-y-0.5",
                        selectedNumber?.phone_number === number.phone_number
                          ? "border-blue-500/50 bg-blue-500/5 shadow-sm"
                          : "border-border hover:border-blue-500/30"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "p-2 rounded-lg transition-all duration-300 flex-shrink-0",
                            selectedNumber?.phone_number === number.phone_number
                              ? "bg-blue-500/15"
                              : "bg-blue-500/10 group-hover:bg-blue-500/15"
                          )}>
                            <Phone className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base mb-1 tracking-tight">
                              {number.phone_number}
                            </div>
                            {number.friendly_name && (
                              <div className="text-sm text-muted-foreground mb-1">
                                {number.friendly_name}
                              </div>
                            )}
                            {number.region && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {number.region}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {number.monthly_price && (
                            <div className="text-sm font-semibold text-blue-600">
                              ${number.monthly_price}/mo
                            </div>
                          )}
                          <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
                            Purchase
                          </Badge>
                        </div>
                      </div>
                      {number.capabilities && (
                        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                          {number.capabilities.voice && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <PhoneCall className="h-3 w-3" />
                              Voice
                            </Badge>
                          )}
                          {number.capabilities.sms && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <MessageSquare className="h-3 w-3" />
                              SMS
                            </Badge>
                          )}
                          {number.capabilities.mms && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Smartphone className="h-3 w-3" />
                              MMS
                            </Badge>
                          )}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : availableNumbers.length === 0 && !loadingNumbers && areaCode ? (
                <div className="text-center py-8 px-4 rounded-xl bg-muted/20">
                  <Search className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground mb-1">
                    No available numbers found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting your search criteria
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-6">
            {/* Selected Number Display */}
            {selectedNumber && (
              <div className={cn(
                "p-5 rounded-xl border transition-all duration-300",
                isFromAccount
                  ? "bg-green-500/5 border-green-500/30"
                  : "bg-blue-500/5 border-blue-500/30"
              )}>
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    isFromAccount ? "bg-green-500/15" : "bg-blue-500/15"
                  )}>
                    <Phone className={cn(
                      "h-5 w-5",
                      isFromAccount ? "text-green-600" : "text-blue-600"
                    )} />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-lg mb-1 tracking-tight">
                      {selectedNumber.phone_number}
                    </div>
                    {selectedNumber.friendly_name && (
                      <div className="text-sm text-muted-foreground mb-2">
                        {selectedNumber.friendly_name}
                      </div>
                    )}
                    <Badge variant="secondary" className={cn(
                      "text-xs",
                      isFromAccount
                        ? "bg-green-500/10 text-green-700 border-green-500/20"
                        : "bg-blue-500/10 text-blue-700 border-blue-500/20"
                    )}>
                      {isFromAccount ? "From Your Account" : "New Purchase"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Form */}
            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="label" className="text-sm font-semibold">
                  Label *
                </Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Main Support Line, Sales Hotline"
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Choose a descriptive name to help you identify this phone number
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="agent" className="text-sm font-semibold">
                  Assign to Agent (Optional)
                </Label>
                <Select
                  value={selectedAgentId}
                  onValueChange={setSelectedAgentId}
                  disabled={loadingAgents}
                >
                  <SelectTrigger id="agent" className="h-11">
                    <SelectValue placeholder="Select an agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground italic">No agent (unassigned)</span>
                    </SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name || `Agent ${agent.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You can assign or reassign this number to different agents anytime
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={assigning}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleAssign}
                disabled={assigning || !label.trim() || loadingAgents}
                className="w-full sm:w-auto shadow-sm hover:shadow-md transition-all"
                size="lg"
              >
                {assigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isFromAccount ? 'Assigning...' : 'Purchasing...'}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {isFromAccount ? 'Assign Number' : 'Purchase & Assign'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
