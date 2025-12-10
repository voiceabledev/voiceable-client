import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  ArrowLeft,
  Download,
  Upload,
  Clock,
  Calendar as CalendarIcon,
  Info,
  Phone,
  User,
  Loader2
} from "lucide-react";
import { phoneNumbersApi, PhoneNumber, agentsApi, Agent, campaignsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function NewCampaign() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [creating, setCreating] = useState(false);
  
  const [campaignName, setCampaignName] = useState("");
  const [selectedPhoneNumberId, setSelectedPhoneNumberId] = useState<string>("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [recipientFile, setRecipientFile] = useState<File | null>(null);
  const [sendOption, setSendOption] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
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
    fetchPhoneNumbers();
    fetchAgents();
  }, [fetchPhoneNumbers, fetchAgents]);

  // Get current date/time for default scheduling
  useEffect(() => {
    if (sendOption === "later" && !scheduleDate) {
      const now = new Date();
      setScheduleDate(now);
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setScheduleTime(`${hours}:${minutes}`);
    }
  }, [sendOption, scheduleDate]);

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
        if (file.size > 25 * 1024 * 1024) {
          toast({
            title: 'File too large',
            description: 'File size must be less than 25MB.',
            variant: 'destructive',
          });
          return;
        }
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
      if (!recipientFile) {
        throw new Error('Recipients file is required');
      }

      const scheduleDateStr = scheduleDate ? scheduleDate.toISOString().split('T')[0] : undefined;

      const response = await campaignsApi.create({
        name: campaignName,
        phone_number_id: selectedPhoneNumberId,
        agent_id: selectedAgentId,
        recipients_file: recipientFile,
        send_immediately: sendOption === "now",
        schedule_date: scheduleDateStr,
        schedule_time: scheduleTime,
      });

      toast({
        title: 'Campaign created',
        description: `Campaign "${campaignName}" has been created and synced with ElevenLabs successfully.`,
      });

      // Navigate back to outbound page
      navigate("/outbound");
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

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between p-3 md:p-4 gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/outbound")} className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <h1 className="text-lg md:text-xl font-semibold truncate">Create a batch call</h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="accent"
              size="sm"
              onClick={handleCreate}
              disabled={
                creating ||
                !selectedPhoneNumberId ||
                !selectedAgentId ||
                !campaignName.trim() ||
                !recipientFile ||
                (sendOption === "later" && (!scheduleDate || !scheduleTime.trim()))
              }
              className="text-xs md:text-sm md:px-4 md:py-2"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Submit a Batch Call</span>
                  <span className="sm:hidden">Submit</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-3xl mx-auto p-4 md:p-6 pr-4 md:pr-6 space-y-4 md:space-y-6">
          {/* Campaign Name */}
          <div className="space-y-2">
            <Label>Campaign Name</Label>
            <Input 
              placeholder="Enter campaign name"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              className="bg-white"
              disabled={creating}
            />
          </div>

          {/* Phone Number Selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Select a phone number</Label>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            {loadingPhoneNumbers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : phoneNumbers.length === 0 ? (
              <div className="p-4 bg-white rounded-lg border border-border">
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
                <SelectTrigger className="bg-white">
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
                {selectedPhoneNumber.phone_number}
                {selectedPhoneNumber.agent_name && (
                  <span className="ml-2">• Currently assigned to {selectedPhoneNumber.agent_name}</span>
                )}
              </p>
            )}
          </div>

          {/* Best Practices Alert */}
          <div className="flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-lg bg-secondary/50 border border-border">
            <Info className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs md:text-sm font-medium mb-1">Best Practices</p>
              <p className="text-xs md:text-sm text-muted-foreground">
                Learn how to avoid spam flagging and optimize your calling strategy for better success rates.{" "}
                <a href="#" className="text-accent hover:underline">
                  Spam flagging best practices
                </a>
              </p>
            </div>
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
              className={`border-2 border-dashed rounded-lg p-6 md:p-8 transition-colors cursor-pointer ${
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
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg border-2 border-muted flex items-center justify-center mb-3 md:mb-4">
                  {recipientFile ? (
                    <Upload className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                  ) : (
                    <Upload className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  {recipientFile ? recipientFile.name : "Drag and drop a CSV or Excel file here or click to select file locally"}
                </p>
                {recipientFile && (
                  <p className="text-xs text-muted-foreground mt-2">
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

          {/* Agent Selection */}
          <div className="space-y-2">
            <Label>Select Agent</Label>
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
                <SelectTrigger className="bg-white">
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

          {/* Timing Section */}
          <div className="space-y-4">
            <Label>Timing</Label>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <button
                type="button"
                className={`p-3 md:p-4 rounded-lg border text-center transition-colors text-sm md:text-base ${
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
                className={`p-3 md:p-4 rounded-lg border text-center transition-colors text-sm md:text-base ${
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
                <Label className="text-sm font-medium">Start at:</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {/* Date Picker */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-foreground">Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal h-10 bg-secondary/50 border-border hover:bg-secondary hover:border-muted-foreground transition-colors",
                            !scheduleDate && "text-muted-foreground"
                          )}
                          disabled={creating}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                          {scheduleDate ? (
                            format(scheduleDate, "PPP")
                          ) : (
                            <span className="text-muted-foreground">Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={scheduleDate}
                          onSelect={setScheduleDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {/* Time Picker */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-foreground">Time</Label>
                    <div className="relative group">
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="bg-secondary/50 border-border h-10 pr-11 hover:bg-secondary hover:border-muted-foreground transition-colors focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none"
                        disabled={creating}
                        style={{ paddingRight: '2.75rem' }}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        <Clock className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
                {scheduleDate && scheduleTime && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Scheduled for: <span className="font-medium text-foreground">
                        {format(scheduleDate, "PPP")} at {format(new Date(`2000-01-01T${scheduleTime}`), "h:mm a")}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
