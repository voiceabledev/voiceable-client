import { useState, useEffect, useCallback, useRef } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { phoneNumbersApi, PhoneNumber, agentsApi, Agent } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Phone, User, Upload, Download, Clock, Info } from "lucide-react";

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCampaignModal({ open, onOpenChange, onSuccess }: CreateCampaignModalProps) {
  const { toast } = useToast();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [campaignName, setCampaignName] = useState("");
  const [recipientFile, setRecipientFile] = useState<File | null>(null);
  const [sendOption, setSendOption] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhoneNumbers = useCallback(async () => {
    setLoadingPhoneNumbers(true);
    try {
      const response = await phoneNumbersApi.list();
      if (response.data) {
        setPhoneNumbers(response.data);
      }
    } catch (err) {
      toast({
        title: 'Error loading phone numbers',
        description: err instanceof Error ? err.message : 'Failed to fetch phone numbers',
        variant: 'destructive',
      });
    } finally {
      setLoadingPhoneNumbers(false);
    }
  }, [toast]);

  const fetchAgents = useCallback(async () => {
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
  }, [toast]);

  useEffect(() => {
    if (open) {
      fetchPhoneNumbers();
      fetchAgents();
    } else {
      // Reset form when modal closes
      setSelectedPhoneNumberId("");
      setSelectedAgentId("");
      setCampaignName("");
      setRecipientFile(null);
      setSendOption("now");
      setScheduleDate("");
      setScheduleTime("");
      setIsDragging(false);
    }
  }, [open, fetchPhoneNumbers, fetchAgents]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv") || file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
        setRecipientFile(file);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV or Excel file.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check file size (25MB limit)
      if (file.size > 25 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'File size must be less than 25MB.',
          variant: 'destructive',
        });
        return;
      }
      if (file.type === "text/csv" || file.name.endsWith(".csv") || file.name.endsWith(".xls") || file.name.endsWith(".xlsx")) {
        setRecipientFile(file);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV or Excel file.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const csvContent = "name,phone_number,language\nNev,+3838310429,en\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recipients_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleCreate = async () => {
    if (!selectedPhoneNumberId) {
      toast({
        title: 'Phone number required',
        description: 'Please select a phone number for the campaign.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedAgentId) {
      toast({
        title: 'Agent required',
        description: 'Please select an agent for the campaign.',
        variant: 'destructive',
      });
      return;
    }

    if (!campaignName.trim()) {
      toast({
        title: 'Campaign name required',
        description: 'Please enter a name for the campaign.',
        variant: 'destructive',
      });
      return;
    }

    if (!recipientFile) {
      toast({
        title: 'Recipients file required',
        description: 'Please upload a CSV or Excel file with recipients.',
        variant: 'destructive',
      });
      return;
    }

    if (sendOption === "later" && (!scheduleDate || !scheduleTime)) {
      toast({
        title: 'Schedule required',
        description: 'Please select a date and time for scheduling.',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      // TODO: Replace with actual campaign creation API call
      // const formData = new FormData();
      // formData.append('name', campaignName);
      // formData.append('phone_number_id', selectedPhoneNumberId);
      // formData.append('agent_id', selectedAgentId);
      // formData.append('recipients_file', recipientFile);
      // formData.append('send_immediately', sendOption === "now" ? "true" : "false");
      // if (sendOption === "later") {
      //   formData.append('schedule_date', scheduleDate);
      //   formData.append('schedule_time', scheduleTime);
      // }
      // await campaignsApi.create(formData);

      // For now, just show success message
      toast({
        title: 'Campaign created',
        description: `Campaign "${campaignName}" has been created successfully.`,
      });

      // Reset form
      setSelectedPhoneNumberId("");
      setSelectedAgentId("");
      setCampaignName("");
      setRecipientFile(null);
      setSendOption("now");
      setScheduleDate("");
      setScheduleTime("");
      
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      toast({
        title: 'Error creating campaign',
        description: err instanceof Error ? err.message : 'Failed to create campaign',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const selectedPhoneNumber = phoneNumbers.find(p => p.id.toString() === selectedPhoneNumberId);
  const selectedAgent = agents.find(a => a.id.toString() === selectedAgentId);

  // Get current date/time for default scheduling
  useEffect(() => {
    if (open && sendOption === "later" && !scheduleDate) {
      const now = new Date();
      setScheduleDate(now.toISOString().split('T')[0]);
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setScheduleTime(`${hours}:${minutes}`);
    }
  }, [open, sendOption, scheduleDate]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Outbound Campaign</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              placeholder="Enter campaign name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              disabled={creating}
            />
          </div>

          {/* Phone Number Selection */}
          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number</Label>
            {loadingPhoneNumbers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : phoneNumbers.length === 0 ? (
              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  No phone numbers available. Please add a phone number first.
                </p>
              </div>
            ) : (
              <Select
                value={selectedPhoneNumberId}
                onValueChange={setSelectedPhoneNumberId}
                disabled={creating}
              >
                <SelectTrigger id="phone-number">
                  <SelectValue placeholder="Select a phone number" />
                </SelectTrigger>
                <SelectContent>
                  {phoneNumbers.map((phone) => (
                    <SelectItem key={phone.id} value={phone.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{phone.phone_number}</span>
                        {phone.label && (
                          <span className="text-xs text-muted-foreground">({phone.label})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedPhoneNumber && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedPhoneNumber.phone_number}
                {selectedPhoneNumber.agent_name && (
                  <span className="ml-2">• Currently assigned to {selectedPhoneNumber.agent_name}</span>
                )}
              </p>
            )}
          </div>

          {/* Agent Selection */}
          <div className="space-y-2">
            <Label htmlFor="agent">Agent</Label>
            {loadingAgents ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : agents.length === 0 ? (
              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  No agents available. Please create an agent first.
                </p>
              </div>
            ) : (
              <Select
                value={selectedAgentId}
                onValueChange={setSelectedAgentId}
                disabled={creating}
              >
                <SelectTrigger id="agent">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id.toString()}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{agent.name || `Agent ${agent.id}`}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedAgent && (
              <p className="text-xs text-muted-foreground">
                Selected: {selectedAgent.name || `Agent ${selectedAgent.id}`}
              </p>
            )}
          </div>

          {/* Recipients Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Recipients</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleDownloadTemplate}
                className="text-xs h-7"
              >
                <Download className="h-3 w-3 mr-1" />
                Template
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Maximum file size: 25.0 MB
            </div>
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.csv,.xls,.xlsx';
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                      handleFileSelect({ target } as React.ChangeEvent<HTMLInputElement>);
                    }
                  };
                  input.click();
                }}
              >
                CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.xls,.xlsx';
                  input.onchange = (e) => {
                    const target = e.target as HTMLInputElement;
                    if (target.files && target.files[0]) {
                      handleFileSelect({ target } as React.ChangeEvent<HTMLInputElement>);
                    }
                  };
                  input.click();
                }}
              >
                XLS
              </Button>
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
                isDragging
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-muted-foreground"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center text-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {recipientFile ? recipientFile.name : "Click to upload or drag and drop"}
                </p>
                {recipientFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {(recipientFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileSelect}
            />
            <div className="p-3 bg-secondary/50 rounded-lg border border-border">
              <div className="flex items-start gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  <strong>Formatting:</strong> The <strong>phone_number</strong> column is required. 
                  You can also pass certain <strong>overrides</strong>. Any other columns will be passed as dynamic variables.
                </p>
              </div>
              <div className="mt-2 text-xs">
                <p className="text-muted-foreground mb-1 font-medium">Example:</p>
                <div className="bg-background rounded p-2 font-mono text-xs overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-1">name</th>
                        <th className="text-left p-1">phone_number</th>
                        <th className="text-left p-1">language</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-1">Nev</td>
                        <td className="p-1">+3838310429</td>
                        <td className="p-1">en</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Timing Section */}
          <div className="space-y-3">
            <Label>Timing</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className={`p-3 rounded-lg border text-center transition-colors text-sm ${
                  sendOption === "now"
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground"
                }`}
                onClick={() => setSendOption("now")}
                disabled={creating}
              >
                Send immediately
              </button>
              <button
                type="button"
                className={`p-3 rounded-lg border text-center transition-colors text-sm ${
                  sendOption === "later"
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-secondary/50 text-muted-foreground hover:border-muted-foreground"
                }`}
                onClick={() => setSendOption("later")}
                disabled={creating}
              >
                Schedule for later
              </button>
            </div>
            {sendOption === "later" && (
              <div className="space-y-3 pt-2">
                <Label className="text-sm">Start at:</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Date</Label>
                    <Input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="bg-secondary/50"
                      disabled={creating}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Time</Label>
                    <div className="relative">
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="bg-secondary/50 pr-10"
                        disabled={creating}
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={creating}
          >
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={handleCreate}
            disabled={
              creating ||
              !selectedPhoneNumberId ||
              !selectedAgentId ||
              !campaignName.trim() ||
              !recipientFile ||
              (sendOption === "later" && (!scheduleDate || !scheduleTime))
            }
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Campaign"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
