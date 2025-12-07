import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { phoneNumbersApi, agentsApi, Agent } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PhoneNumberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type PhoneOption = 
  | "import-twilio" 
  | "import-vonage" 
  | "import-telnyx"

const phoneOptions: { id: PhoneOption; label: string; importLabel: string }[] = [
  { id: "import-twilio", label: "Twilio", importLabel: "Import Twilio" },
  { id: "import-vonage", label: "Vonage", importLabel: "Import Vonage" },
  { id: "import-telnyx", label: "Telnyx", importLabel: "Import Telnyx" },
];

export function PhoneNumberModal({ open, onOpenChange }: PhoneNumberModalProps) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<PhoneOption>("import-twilio");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [telnyxApiKey, setTelnyxApiKey] = useState("");
  const [label, setLabel] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("none");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAgents();
    }
  }, [open]);

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

  const handleImport = async () => {
    if (!phoneNumber || !label) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (selectedOption === "import-twilio" && (!accountSid || !authToken)) {
      toast({
        title: 'Error',
        description: 'Twilio Account SID and Auth Token are required.',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);
    try {
      const provider = selectedOption === "import-twilio" ? "twilio" : 
                      selectedOption === "import-vonage" ? "vonage" : "telnyx";
      
      const params: any = {
        phone_number: phoneNumber,
        label: label,
        provider: provider,
      };

      if (selectedOption === "import-twilio") {
        params.twilio_sid = accountSid;
        params.twilio_token = authToken;
      }

      if (selectedAgentId !== "none") {
        params.agent_id = selectedAgentId;
      }

      const response = await phoneNumbersApi.create(params);
      
      if (response.data) {
        toast({
          title: 'Success',
          description: 'Phone number imported successfully.',
        });
        onOpenChange(false);
        resetForm();
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to import phone number',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const resetForm = () => {
    setPhoneNumber("");
    setAccountSid("");
    setAuthToken("");
    setApiKey("");
    setApiSecret("");
    setTelnyxApiKey("");
    setLabel("");
    setSmsEnabled(true);
    setSelectedAgentId("none");
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <DialogHeader>
          <DialogTitle>Phone Number Options</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 md:gap-6">
          {/* Provider Selection - Mobile: Centered Select, Desktop: Horizontal Row */}
          {isMobile ? (
            <div className="space-y-2">
              <Label className="text-center block">Provider</Label>
              <Select value={selectedOption} onValueChange={(value) => setSelectedOption(value as PhoneOption)}>
                <SelectTrigger className="w-full text-center">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {phoneOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id} className="text-center">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="w-full space-y-2">
              <p className="text-sm font-medium text-foreground">Provider</p>
              <div className="flex flex-row gap-2">
                {phoneOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={cn(
                      "flex-1 text-center px-3 py-2 rounded-md text-sm transition-colors",
                      selectedOption === option.id
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    {option.importLabel}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="flex-1 space-y-4 min-w-0">
            {selectedOption === "import-twilio" && (
              <>
                <div className="space-y-2">
                  <Label>Twilio Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-2 md:px-3 py-2 bg-secondary/50 border border-border rounded-md flex-shrink-0">
                      <span className="text-base md:text-lg">🇺🇸</span>
                    </div>
                    <Input 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-secondary/50 flex-1 text-sm md:text-base"
                      placeholder="+14156021922"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Twilio Account SID</Label>
                  <Input 
                    value={accountSid}
                    onChange={(e) => setAccountSid(e.target.value)}
                    className="bg-secondary/50 text-sm md:text-base"
                    placeholder="Twilio Account SID"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Twilio Auth Token</Label>
                  <Input 
                    type="password"
                    value={authToken}
                    onChange={(e) => setAuthToken(e.target.value)}
                    className="bg-secondary/50 text-sm md:text-base"
                    placeholder="Twilio Auth Token"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input 
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="bg-secondary/50 text-sm md:text-base"
                    placeholder="Label for Phone Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Agent (Optional)</Label>
                  <Select value={selectedAgentId} onValueChange={setSelectedAgentId} disabled={loadingAgents}>
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
                </div>

                <div className="bg-secondary/30 border border-border rounded-lg p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm md:text-base">SMS Enabled</p>
                      <p className="text-xs md:text-sm text-muted-foreground">Enable SMS messaging for this phone number</p>
                    </div>
                    <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => handleClose(false)} className="w-full sm:w-auto" disabled={importing}>
                    Cancel
                  </Button>
                  <Button variant="accent" className="w-full sm:w-auto" onClick={handleImport} disabled={importing || loadingAgents}>
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      'Import from Twilio'
                    )}
                  </Button>
                </div>
              </>
            )}

            {selectedOption === "import-vonage" && (
              <>
                <div className="space-y-2">
                  <Label>Vonage Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-2 md:px-3 py-2 bg-secondary/50 border border-border rounded-md flex-shrink-0">
                      <span className="text-base md:text-lg">🇺🇸</span>
                    </div>
                    <Input 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-secondary/50 flex-1 text-sm md:text-base"
                      placeholder="+14156021922"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="bg-secondary/50 text-sm md:text-base"
                    placeholder="Enter API Key"
                  />
                </div>

                <div className="space-y-2">
                  <Label>API Secret</Label>
                  <Input 
                    type="password"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    className="bg-secondary/50 text-sm md:text-base"
                    placeholder="Enter API Secret"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input 
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="bg-secondary/50 text-sm md:text-base"
                    placeholder="Label for Phone Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Agent (Optional)</Label>
                  <Select value={selectedAgentId} onValueChange={setSelectedAgentId} disabled={loadingAgents}>
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
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => handleClose(false)} className="w-full sm:w-auto" disabled={importing}>
                    Cancel
                  </Button>
                  <Button variant="accent" className="w-full sm:w-auto" onClick={handleImport} disabled={importing || loadingAgents}>
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      'Import from Vonage'
                    )}
                  </Button>
                </div>
              </>
            )}

            {selectedOption === "import-telnyx" && (
              <>
                <div className="space-y-2">
                  <Label>Telnyx Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-2 md:px-3 py-2 bg-secondary/50 border border-border rounded-md flex-shrink-0">
                      <span className="text-base md:text-lg">🇺🇸</span>
                    </div>
                    <Input 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-secondary/50 flex-1 text-sm md:text-base"
                      placeholder="+14156021922"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input 
                    value={telnyxApiKey}
                    onChange={(e) => setTelnyxApiKey(e.target.value)}
                    className="bg-secondary/50 text-sm md:text-base"
                    placeholder="Enter API Key"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Label</Label>
                  <Input 
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="bg-secondary/50 text-sm md:text-base"
                    placeholder="Label for Phone Number"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Agent (Optional)</Label>
                  <Select value={selectedAgentId} onValueChange={setSelectedAgentId} disabled={loadingAgents}>
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
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => handleClose(false)} className="w-full sm:w-auto" disabled={importing}>
                    Cancel
                  </Button>
                  <Button variant="accent" className="w-full sm:w-auto" onClick={handleImport} disabled={importing || loadingAgents}>
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      'Import from Telnyx'
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
