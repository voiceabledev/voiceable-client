import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { phoneNumbersApi, agentsApi, Agent, AvailablePhoneNumber } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Phone, Check, ShoppingCart, CheckCircle2 } from "lucide-react";

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
      
      if (err?.response?.status === 403 && err?.response?.data?.error === 'purchase_requirement') {
        toast({
          title: 'Purchase Required',
          description: 'Phone number purchases require at least one successful payment. You can use the widget to test your agent without purchasing a phone number.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error loading available numbers',
          description: err instanceof Error ? err.message : 'Failed to fetch available phone numbers',
          variant: 'destructive',
        });
      }
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
                           (err?.response?.data?.error === 'purchase_requirement'
                             ? 'Phone number purchases require at least one successful payment. You can use the widget to test your agent without purchasing a phone number.'
                             : (err instanceof Error ? err.message : 'Failed to assign phone number'));
      
      toast({
        title: err?.response?.data?.error === 'purchase_requirement' ? 'Purchase Required' : 'Error',
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
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle>
            {step === "account" ? "Phone Numbers" :
             "Assign Phone Number"}
          </DialogTitle>
        </DialogHeader>
        
        {step === "account" ? (
          <div className="flex flex-col gap-4 md:gap-6">
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These are phone numbers available in your account that haven't been assigned yet.
              </p>

              {loadingAccountNumbers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : accountNumbers.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <p className="text-sm font-medium">
                      {accountNumbers.length} number{accountNumbers.length !== 1 ? 's' : ''} available in your account
                    </p>
                  </div>
                  {accountNumbers.map((number, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectNumber(number)}
                      className={cn(
                        "w-full p-4 bg-card border border-border rounded-lg hover:bg-secondary/50 transition-colors text-left relative",
                        selectedNumber?.phone_number === number.phone_number && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-base">{number.phone_number}</div>
                            {number.friendly_name && (
                              <div className="text-sm text-muted-foreground">{number.friendly_name}</div>
                            )}
                            {number.region && (
                              <div className="text-xs text-muted-foreground">{number.region}</div>
                            )}
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-md">
                          In Account
                        </span>
                      </div>
                      {number.capabilities && (
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                          {number.capabilities.voice && <span>Voice</span>}
                          {number.capabilities.sms && <span>SMS</span>}
                          {number.capabilities.mms && <span>MMS</span>}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No numbers available in your account.</p>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Search for additional phone numbers to purchase.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Area Code (Optional)</Label>
                    <Input
                      value={areaCode}
                      onChange={(e) => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                      placeholder="e.g., 415"
                      className="bg-secondary/50"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSearch}
                  disabled={loadingNumbers}
                  className="w-full"
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

              {/* Available Numbers List */}
              {loadingNumbers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : availableNumbers.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="h-4 w-4 text-blue-500" />
                    <p className="text-sm font-medium">
                      {availableNumbers.length} available number{availableNumbers.length !== 1 ? 's' : ''} found for purchase
                    </p>
                  </div>
                  {availableNumbers.map((number, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectNumber(number)}
                      className={cn(
                        "w-full p-4 bg-card border border-border rounded-lg hover:bg-secondary/50 transition-colors text-left relative",
                        selectedNumber?.phone_number === number.phone_number && "border-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-base">{number.phone_number}</div>
                            {number.friendly_name && (
                              <div className="text-sm text-muted-foreground">{number.friendly_name}</div>
                            )}
                            {number.region && (
                              <div className="text-xs text-muted-foreground">{number.region}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {number.monthly_price && (
                            <div className="text-sm font-medium text-muted-foreground">
                              ${number.monthly_price}/mo
                            </div>
                          )}
                          <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
                            Purchase
                          </span>
                        </div>
                      </div>
                      {number.capabilities && (
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                          {number.capabilities.voice && <span>Voice</span>}
                          {number.capabilities.sms && <span>SMS</span>}
                          {number.capabilities.mms && <span>MMS</span>}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : !loadingNumbers ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No available numbers found. Try adjusting your search criteria.</p>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Selected Number Display */}
            {selectedNumber && (
              <div className="p-4 bg-secondary/30 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-base">{selectedNumber.phone_number}</div>
                    {selectedNumber.friendly_name && (
                      <div className="text-sm text-muted-foreground">{selectedNumber.friendly_name}</div>
                    )}
                    {isFromAccount && (
                      <div className="text-xs text-muted-foreground mt-1">
                        From your Twilio account
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Assignment Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Label *</Label>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Main Support Line"
                  className="bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground">
                  A descriptive label to identify this phone number
                </p>
              </div>

              <div className="space-y-2">
                <Label>Agent (Optional)</Label>
                <Select
                  value={selectedAgentId}
                  onValueChange={setSelectedAgentId}
                  disabled={loadingAgents}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an agent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No agent (unassigned)</SelectItem>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id.toString()}>
                        {agent.name || `Agent ${agent.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Assign this number to an agent. You can change this later.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={handleBack} disabled={assigning}>
                Back
              </Button>
              <Button
                variant="accent"
                onClick={handleAssign}
                disabled={assigning || !label.trim() || loadingAgents}
                className="w-full sm:w-auto"
              >
                {assigning ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isFromAccount ? 'Assigning...' : 'Purchasing...'}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    {isFromAccount ? 'Assign' : 'Purchase & Assign'}
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
