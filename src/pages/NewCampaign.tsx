import { useState, useEffect, useCallback } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft,
  Clock,
  Calendar as CalendarIcon,
  Info,
  Phone,
  User,
  Loader2,
  TrendingUp,
  Shield,
  Users,
  MessageSquare,
  BarChart3,
  AlertCircle
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
  const [selectedPhoneNumberIds, setSelectedPhoneNumberIds] = useState<string[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [sendOption, setSendOption] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState("");
  
  const [isSpamPracticesOpen, setIsSpamPracticesOpen] = useState(false);

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

  const handlePhoneNumberToggle = (phoneId: string) => {
    setSelectedPhoneNumberIds(prev => 
      prev.includes(phoneId)
        ? prev.filter(id => id !== phoneId)
        : [...prev, phoneId]
    );
  };






  const handleCreate = async () => {
    if (!selectedAgentId) {
      toast({
        title: 'Agent required',
        description: 'Please select an agent for the campaign.',
        variant: 'destructive',
      });
      return;
    }

    if (!hasTwilioNumbers) {
      toast({
        title: 'No Twilio numbers available',
        description: 'The selected agent has no Twilio phone numbers associated. Please assign Twilio phone numbers to this agent before creating a batch call.',
        variant: 'destructive',
      });
      return;
    }

    if (validSelectedPhoneNumberIds.length === 0) {
      toast({
        title: 'Phone number required',
        description: 'Please select at least one Twilio phone number for the campaign.',
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
      const scheduleDateStr = scheduleDate ? scheduleDate.toISOString().split('T')[0] : undefined;

      // Only use valid Twilio phone number IDs (no manual numbers allowed for batch calls)
      const response = await campaignsApi.create({
        name: campaignName,
        phone_number_ids: validSelectedPhoneNumberIds,
        agent_id: selectedAgentId,
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

  const selectedAgent = agents.find(a => a.id.toString() === selectedAgentId);

  // Categorize agents by whether they have Twilio phone numbers
  const agentsWithTwilioNumbers = agents.filter(agent => {
    return phoneNumbers.some(phone => 
      phone.agent_id?.toString() === agent.id.toString() && phone.provider === 'twilio'
    );
  });

  const agentsWithoutTwilioNumbers = agents.filter(agent => {
    return !phoneNumbers.some(phone => 
      phone.agent_id?.toString() === agent.id.toString() && phone.provider === 'twilio'
    );
  });

  // Filter phone numbers to only show Twilio numbers associated with the selected agent
  const availablePhoneNumbers = selectedAgentId
    ? phoneNumbers.filter(phone => 
        phone.agent_id?.toString() === selectedAgentId && 
        phone.provider === 'twilio'
      )
    : [];

  // Check if selected agent has Twilio numbers
  const hasTwilioNumbers = selectedAgentId 
    ? availablePhoneNumbers.length > 0
    : false;

  // Filter selected phone numbers to only include valid ones for the selected agent
  const validSelectedPhoneNumberIds = selectedPhoneNumberIds.filter(id => {
    if (!selectedAgentId) return false;
    const phone = phoneNumbers.find(p => p.id.toString() === id);
    return phone && phone.agent_id?.toString() === selectedAgentId && phone.provider === 'twilio';
  });

  // Clear invalid selections when agent changes
  useEffect(() => {
    if (selectedAgentId) {
      const validIds = selectedPhoneNumberIds.filter(id => {
        const phone = phoneNumbers.find(p => p.id.toString() === id);
        return phone && phone.agent_id?.toString() === selectedAgentId && phone.provider === 'twilio';
      });
      if (validIds.length !== selectedPhoneNumberIds.length) {
        setSelectedPhoneNumberIds(validIds);
      }
    } else {
      // Clear all selections if no agent is selected
      setSelectedPhoneNumberIds([]);
    }
  }, [selectedAgentId, phoneNumbers, selectedPhoneNumberIds]);

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
                !selectedAgentId ||
                !hasTwilioNumbers ||
                validSelectedPhoneNumberIds.length === 0 ||
                !campaignName.trim() ||
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
                onValueChange={(value) => {
                  setSelectedAgentId(value);
                  // Clear phone number selections when agent changes
                  setSelectedPhoneNumberIds([]);
                }}
                disabled={creating}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {/* Agents with Twilio numbers */}
                  {agentsWithTwilioNumbers.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                        Agents with Twilio Numbers
                      </div>
                      {agentsWithTwilioNumbers.map((agent) => {
                        const twilioCount = phoneNumbers.filter(
                          p => p.agent_id?.toString() === agent.id.toString() && p.provider === 'twilio'
                        ).length;
                        return (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{agent.name || `Agent ${agent.id}`}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                ({twilioCount} number{twilioCount !== 1 ? 's' : ''})
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </>
                  )}
                  
                  {/* Agents without Twilio numbers */}
                  {agentsWithoutTwilioNumbers.length > 0 && (
                    <>
                      {agentsWithTwilioNumbers.length > 0 && (
                        <div className="border-t border-border my-1" />
                      )}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                        Agents without Twilio Numbers
                      </div>
                      {agentsWithoutTwilioNumbers.map((agent) => (
                        <SelectItem 
                          key={agent.id} 
                          value={agent.id.toString()}
                          disabled={true}
                        >
                          <div className="flex items-center gap-2 opacity-60">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{agent.name || `Agent ${agent.id}`}</span>
                            <span className="text-xs text-muted-foreground ml-auto">
                              (No numbers)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            )}
            {selectedAgent && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Selected: {selectedAgent.name || `Agent ${selectedAgent.id}`}
                </p>
                {!hasTwilioNumbers && selectedAgentId && (
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      This agent has no Twilio phone numbers associated. Please assign Twilio phone numbers to this agent before creating a batch call.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Phone Number Selection - Multi-select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>Select phone numbers</Label>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
              {selectedAgentId && availablePhoneNumbers.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (validSelectedPhoneNumberIds.length === availablePhoneNumbers.length) {
                      setSelectedPhoneNumberIds([]);
                    } else {
                      setSelectedPhoneNumberIds(availablePhoneNumbers.map(p => p.id.toString()));
                    }
                  }}
                  className="text-xs h-7"
                >
                  {validSelectedPhoneNumberIds.length === availablePhoneNumbers.length ? "Deselect All" : "Select All"}
                </Button>
              )}
            </div>
            {!selectedAgentId ? (
              <div className="p-4 bg-secondary/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Please select an agent first to see available phone numbers.
                </p>
              </div>
            ) : loadingPhoneNumbers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : availablePhoneNumbers.length === 0 ? (
              <div className="p-4 bg-white rounded-lg border border-border">
                <p className="text-sm text-muted-foreground text-center">
                  This agent has no Twilio phone numbers associated. Please assign Twilio phone numbers to this agent in the Phone Numbers section.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-border max-h-[300px] overflow-y-auto">
                {/* Only show Twilio phone numbers associated with the selected agent */}
                {availablePhoneNumbers.map((phone) => (
                  <div
                    key={phone.id}
                    className="flex items-center space-x-3 p-3 hover:bg-secondary/50 border-b border-border last:border-b-0"
                  >
                    <Checkbox
                      id={`phone-${phone.id}`}
                      checked={validSelectedPhoneNumberIds.includes(phone.id.toString())}
                      onCheckedChange={() => handlePhoneNumberToggle(phone.id.toString())}
                      disabled={creating}
                    />
                    <label
                      htmlFor={`phone-${phone.id}`}
                      className="flex-1 flex items-center gap-2 cursor-pointer"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{phone.phone_number}</span>
                      {phone.label && (
                        <span className="text-xs text-muted-foreground">({phone.label})</span>
                      )}
                      <span className="text-xs text-muted-foreground ml-auto">
                        • Twilio
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
            {validSelectedPhoneNumberIds.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {validSelectedPhoneNumberIds.length} phone number{validSelectedPhoneNumberIds.length !== 1 ? 's' : ''} selected
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
                <button
                  type="button"
                  onClick={() => setIsSpamPracticesOpen(true)}
                  className="text-accent hover:underline cursor-pointer"
                >
                  Spam flagging best practices
                </button>
              </p>
            </div>
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

      {/* Spam Flagging Best Practices Modal */}
      <Dialog open={isSpamPracticesOpen} onOpenChange={setIsSpamPracticesOpen}>
        <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Spam Flagging Best Practices</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Follow these guidelines to avoid spam flagging and optimize your calling strategy for better success rates.
            </p>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {/* Call Volume Management */}
            <div className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold text-base text-foreground">Call Volume Management</h3>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>Start with low call volumes and gradually increase over time</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>Avoid sending large batches of calls all at once</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>Spread calls throughout the day rather than in concentrated bursts</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <span>Monitor call completion rates and adjust volume accordingly</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Call Timing */}
            <div className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 flex-shrink-0">
                  <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold text-base text-foreground">Call Timing</h3>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>Respect local time zones and calling hours (typically 8 AM - 9 PM)</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>Avoid calling during holidays and weekends unless necessary</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>Space out calls to the same recipient over multiple days</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                      <span>Consider time-of-day patterns for your target audience</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recipient Management */}
            <div className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-green-500/10 border border-green-500/20 flex-shrink-0">
                  <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold text-base text-foreground">Recipient Management</h3>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span>Only call recipients who have opted in or have an existing relationship</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span>Maintain a "Do Not Call" list and respect opt-outs immediately</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span>Verify phone numbers before calling to reduce invalid number attempts</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span>Remove duplicate entries and invalid numbers from your list</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Call Quality & Content */}
            <div className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/20 flex-shrink-0">
                  <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold text-base text-foreground">Call Quality & Content</h3>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                      <span>Ensure your agent provides clear, valuable information</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                      <span>Allow recipients to easily opt-out or end the call</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                      <span>Avoid aggressive or misleading messaging</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-orange-600 dark:text-orange-400 mt-0.5">•</span>
                      <span>Personalize calls when possible using recipient data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Compliance */}
            <div className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex-shrink-0">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold text-base text-foreground">Compliance</h3>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                      <span>Comply with TCPA (Telephone Consumer Protection Act) regulations</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                      <span>Obtain proper consent before making calls</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                      <span>Identify your business clearly at the start of calls</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                      <span>Maintain records of consent and call logs for compliance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Monitoring & Optimization */}
            <div className="p-4 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="flex-1 space-y-3">
                  <h3 className="font-semibold text-base text-foreground">Monitoring & Optimization</h3>
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                      <span>Track call success rates, answer rates, and completion rates</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                      <span>Monitor for patterns that might trigger spam flags</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                      <span>Adjust your strategy based on performance metrics</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                      <span>Test different approaches and measure results</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
