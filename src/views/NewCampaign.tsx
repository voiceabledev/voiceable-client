"use client"

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Plus,
  X,
  Globe,
  Sparkles,
  Zap,
  CheckCircle2,
  PhoneOutgoing,
  Bot,
  FileText,
  Send
} from "lucide-react";
import { phoneNumbersApi, PhoneNumber, agentsApi, Agent, campaignsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AddPhoneNumberModal } from "@/components/AddPhoneNumberModal";

const LANGUAGES = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Spanish", flag: "🇪🇸" },
  { value: "fr", label: "French", flag: "🇫🇷" },
  { value: "de", label: "German", flag: "🇩🇪" },
  { value: "it", label: "Italian", flag: "🇮🇹" },
  { value: "pt", label: "Portuguese", flag: "🇵🇹" },
  { value: "zh", label: "Chinese", flag: "🇨🇳" },
  { value: "ja", label: "Japanese", flag: "🇯🇵" },
  { value: "ko", label: "Korean", flag: "🇰🇷" },
  { value: "ar", label: "Arabic", flag: "🇸🇦" },
  { value: "hi", label: "Hindi", flag: "🇮🇳" },
  { value: "ru", label: "Russian", flag: "🇷🇺" },
];

interface StepIndicatorProps {
  currentStep: number;
  steps: { label: string; icon: React.ReactNode }[];
}

function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300",
              index < currentStep
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : index === currentStep
                ? "bg-accent/10 text-accent border border-accent/30"
                : "bg-muted text-muted-foreground"
            )}
          >
            <span className={cn(
              "transition-transform duration-300",
              index === currentStep && "scale-110"
            )}>
              {index < currentStep ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                step.icon
              )}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-8 h-0.5 mx-1 rounded-full transition-colors duration-300",
                index < currentStep ? "bg-emerald-500/50" : "bg-border"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function NewCampaign() {
  const router = useRouter();
  const { toast } = useToast();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loadingPhoneNumbers, setLoadingPhoneNumbers] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [creating, setCreating] = useState(false);

  const [campaignName, setCampaignName] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [sendOption, setSendOption] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState("");

  const [isSpamPracticesOpen, setIsSpamPracticesOpen] = useState(false);
  const [isPhoneNumberModalOpen, setIsPhoneNumberModalOpen] = useState(false);

  interface ManualPhoneNumber {
    name: string;
    phone_number: string;
    language: string;
  }
  const [manualPhoneNumbers, setManualPhoneNumbers] = useState<ManualPhoneNumber[]>([]);

  // Calculate current step
  const getCurrentStep = () => {
    if (!campaignName.trim()) return 0;
    if (!selectedAgentId) return 1;
    if (manualPhoneNumbers.length === 0) return 2;
    return 3;
  };

  const steps = [
    { label: "Name", icon: <FileText className="h-3.5 w-3.5" /> },
    { label: "Agent", icon: <Bot className="h-3.5 w-3.5" /> },
    { label: "Recipients", icon: <Users className="h-3.5 w-3.5" /> },
    { label: "Schedule", icon: <Clock className="h-3.5 w-3.5" /> },
  ];

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

  useEffect(() => {
    if (sendOption === "later" && !scheduleDate) {
      const now = new Date();
      setScheduleDate(now);
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setScheduleTime(`${hours}:${minutes}`);
    }
  }, [sendOption, scheduleDate]);

  const handleAddManualPhoneNumber = (phoneNumber: ManualPhoneNumber) => {
    setManualPhoneNumbers(prev => [...prev, phoneNumber]);
  };

  const handleRemoveManualPhoneNumber = (index: number) => {
    setManualPhoneNumbers(prev => prev.filter((_, i) => i !== index));
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

    if (manualPhoneNumbers.length === 0) {
      toast({
        title: 'Recipient phone numbers required',
        description: 'Please add at least one recipient phone number for the batch call.',
        variant: 'destructive',
      });
      return;
    }

    const agentPhoneNumbersFiltered = phoneNumbers.filter(phone =>
      phone.agent_id?.toString() === selectedAgentId && phone.provider === 'twilio'
    );

    if (agentPhoneNumbersFiltered.length === 0) {
      toast({
        title: 'Agent phone number required',
        description: 'The selected agent has no Twilio phone numbers associated. Please assign a phone number to this agent first.',
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

      const agentPhoneNumberIds = phoneNumbers
        .filter(phone => phone.agent_id?.toString() === selectedAgentId && phone.provider === 'twilio')
        .map(phone => phone.id.toString());

      await campaignsApi.create({
        name: campaignName,
        phone_number_ids: agentPhoneNumberIds,
        manual_phone_numbers: manualPhoneNumbers,
        agent_id: selectedAgentId,
        send_immediately: sendOption === "now",
        schedule_date: scheduleDateStr,
        schedule_time: scheduleTime,
      });

      toast({
        title: 'Campaign created',
        description: `Campaign "${campaignName}" has been created and synced with ElevenLabs successfully.`,
      });

      router.push("/outbound");
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

  const agentPhoneNumbers = selectedAgentId
    ? phoneNumbers.filter(phone =>
        phone.agent_id?.toString() === selectedAgentId && phone.provider === 'twilio'
      )
    : [];

  const isFormValid =
    campaignName.trim() &&
    selectedAgentId &&
    manualPhoneNumbers.length > 0 &&
    agentPhoneNumbers.length > 0 &&
    (sendOption === "now" || (scheduleDate && scheduleTime.trim()));

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border flex-shrink-0 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between p-4 md:p-5 gap-4">
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/outbound")}
              className="flex-shrink-0 hover:bg-accent/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent to-violet-light flex items-center justify-center shadow-lg shadow-accent/20">
                <PhoneOutgoing className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-semibold">Create Batch Call</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Set up your automated calling campaign</p>
              </div>
            </div>
          </div>
          <Button
            variant="accent"
            onClick={handleCreate}
            disabled={creating || !isFormValid}
            className="shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="hidden sm:inline">Creating...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Launch Campaign</span>
                <span className="sm:hidden">Launch</span>
              </>
            )}
          </Button>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={getCurrentStep()} steps={steps} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-5">

          {/* Campaign Name Card */}
          <Card className={cn(
            "overflow-hidden transition-all duration-300",
            getCurrentStep() === 0 && "ring-2 ring-accent/50 shadow-lg shadow-accent/10"
          )}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                  campaignName.trim() ? "bg-emerald-500/10" : "bg-accent/10"
                )}>
                  {campaignName.trim() ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <FileText className="h-5 w-5 text-accent" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Label className="text-sm font-semibold">Campaign Name</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Give your campaign a memorable name</p>
                  </div>
                  <Input
                    placeholder="e.g., Q1 Customer Outreach, Product Launch Follow-up"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="bg-muted/50 border-border h-11 text-base focus:ring-2 focus:ring-accent/30"
                    disabled={creating}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agent Selection Card */}
          <Card className={cn(
            "overflow-hidden transition-all duration-300",
            getCurrentStep() === 1 && "ring-2 ring-accent/50 shadow-lg shadow-accent/10"
          )}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                  selectedAgentId ? "bg-emerald-500/10" : "bg-accent/10"
                )}>
                  {selectedAgentId ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Bot className="h-5 w-5 text-accent" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Label className="text-sm font-semibold">AI Agent</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Select the agent that will handle the calls</p>
                  </div>

                  {loadingAgents ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-accent" />
                    </div>
                  ) : agents.length === 0 ? (
                    <div className="p-4 bg-muted/50 rounded-xl border border-dashed border-border">
                      <div className="text-center">
                        <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No agents available</p>
                        <p className="text-xs text-muted-foreground mt-1">Create an agent first to get started</p>
                      </div>
                    </div>
                  ) : (
                    <Select
                      value={selectedAgentId}
                      onValueChange={setSelectedAgentId}
                      disabled={creating}
                    >
                      <SelectTrigger className="bg-muted/50 border-border h-11">
                        <SelectValue placeholder="Choose an agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            <div className="flex items-center gap-3">
                              <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
                                <Bot className="h-4 w-4 text-accent" />
                              </div>
                              <span className="font-medium">{agent.name || `Agent ${agent.id}`}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Selected Agent Info */}
                  {selectedAgent && (
                    <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg border border-border">
                        <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{selectedAgent.name || `Agent ${selectedAgent.id}`}</p>
                          <p className="text-xs text-muted-foreground">Selected agent</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      </div>

                      {agentPhoneNumbers.length > 0 ? (
                        <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Phone className="h-4 w-4 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Caller ID Numbers</span>
                          </div>
                          <div className="space-y-1.5">
                            {agentPhoneNumbers.map((phone) => (
                              <div key={phone.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span className="font-mono">{phone.phone_number}</span>
                                {phone.label && <span className="text-muted-foreground/60">({phone.label})</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                          <div className="flex items-center gap-2">
                            <Info className="h-4 w-4 text-amber-500" />
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              This agent has no phone numbers. Assign one to proceed.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipients Card */}
          <Card className={cn(
            "overflow-hidden transition-all duration-300",
            getCurrentStep() === 2 && "ring-2 ring-accent/50 shadow-lg shadow-accent/10"
          )}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                  manualPhoneNumbers.length > 0 ? "bg-emerald-500/10" : "bg-accent/10"
                )}>
                  {manualPhoneNumbers.length > 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Users className="h-5 w-5 text-accent" />
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-semibold">Recipients</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">Add the phone numbers to call</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPhoneNumberModalOpen(true)}
                      className="h-8 text-xs hover:bg-accent/10 hover:text-accent hover:border-accent/50 transition-colors"
                      disabled={creating}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5" />
                      Add Recipient
                    </Button>
                  </div>

                  {manualPhoneNumbers.length === 0 ? (
                    <button
                      type="button"
                      onClick={() => setIsPhoneNumberModalOpen(true)}
                      className="w-full p-6 bg-muted/30 rounded-xl border-2 border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-all group"
                      disabled={creating}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Plus className="h-6 w-6 text-accent" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-foreground">Add your first recipient</p>
                          <p className="text-xs text-muted-foreground mt-1">Click to add phone numbers to your batch call</p>
                        </div>
                      </div>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-accent/10 text-accent">
                          {manualPhoneNumbers.length} recipient{manualPhoneNumbers.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {manualPhoneNumbers.map((phone, index) => {
                          const langInfo = LANGUAGES.find(l => l.value === phone.language);
                          return (
                            <div
                              key={index}
                              className="group relative p-3 bg-muted/30 rounded-xl border border-border hover:border-accent/30 hover:bg-muted/50 transition-all animate-in slide-in-from-bottom-2 duration-200"
                              style={{ animationDelay: `${index * 50}ms` }}
                            >
                              <button
                                type="button"
                                onClick={() => handleRemoveManualPhoneNumber(index)}
                                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all shadow-lg"
                                disabled={creating}
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                                  <Phone className="h-4 w-4 text-accent" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{phone.name}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{phone.phone_number}</p>
                                </div>
                                <div className="text-lg" title={langInfo?.label}>
                                  {langInfo?.flag || "🌐"}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timing Card */}
          <Card className={cn(
            "overflow-hidden transition-all duration-300",
            getCurrentStep() === 3 && "ring-2 ring-accent/50 shadow-lg shadow-accent/10"
          )}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">When to Send</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Choose when to launch your campaign</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={cn(
                        "relative p-4 rounded-xl border-2 text-left transition-all duration-200 group",
                        sendOption === "now"
                          ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                          : "border-border bg-muted/30 hover:border-muted-foreground hover:bg-muted/50"
                      )}
                      onClick={() => setSendOption("now")}
                      disabled={creating}
                    >
                      {sendOption === "now" && (
                        <div className="absolute -top-1.5 -right-1.5">
                          <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                          sendOption === "now" ? "bg-accent/20" : "bg-muted"
                        )}>
                          <Zap className={cn(
                            "h-5 w-5 transition-colors",
                            sendOption === "now" ? "text-accent" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <p className={cn(
                            "font-medium text-sm transition-colors",
                            sendOption === "now" ? "text-foreground" : "text-muted-foreground"
                          )}>
                            Send Now
                          </p>
                          <p className="text-xs text-muted-foreground">Start immediately</p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={cn(
                        "relative p-4 rounded-xl border-2 text-left transition-all duration-200 group",
                        sendOption === "later"
                          ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                          : "border-border bg-muted/30 hover:border-muted-foreground hover:bg-muted/50"
                      )}
                      onClick={() => setSendOption("later")}
                      disabled={creating}
                    >
                      {sendOption === "later" && (
                        <div className="absolute -top-1.5 -right-1.5">
                          <div className="h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                          sendOption === "later" ? "bg-accent/20" : "bg-muted"
                        )}>
                          <CalendarIcon className={cn(
                            "h-5 w-5 transition-colors",
                            sendOption === "later" ? "text-accent" : "text-muted-foreground"
                          )} />
                        </div>
                        <div>
                          <p className={cn(
                            "font-medium text-sm transition-colors",
                            sendOption === "later" ? "text-foreground" : "text-muted-foreground"
                          )}>
                            Schedule
                          </p>
                          <p className="text-xs text-muted-foreground">Pick date & time</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {sendOption === "later" && (
                    <div className="space-y-3 pt-2 animate-in slide-in-from-top-2 duration-300">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Schedule Details
                      </Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal h-11 bg-muted/50 border-border hover:bg-muted hover:border-accent/50 transition-all",
                                  !scheduleDate && "text-muted-foreground"
                                )}
                                disabled={creating}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-accent" />
                                {scheduleDate ? (
                                  format(scheduleDate, "PPP")
                                ) : (
                                  <span>Pick a date</span>
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

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Time</Label>
                          <div className="relative">
                            <Input
                              type="time"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="bg-muted/50 border-border h-11 pr-11 hover:bg-muted hover:border-accent/50 transition-all focus:ring-2 focus:ring-accent/30 [&::-webkit-calendar-picker-indicator]:opacity-0"
                              disabled={creating}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <Clock className="h-4 w-4 text-accent" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {scheduleDate && scheduleTime && (
                        <div className="flex items-center gap-2 p-3 bg-accent/5 rounded-lg border border-accent/20 animate-in fade-in duration-300">
                          <Sparkles className="h-4 w-4 text-accent" />
                          <p className="text-sm">
                            <span className="text-muted-foreground">Campaign will launch on </span>
                            <span className="font-semibold text-foreground">
                              {format(scheduleDate, "MMMM d, yyyy")}
                            </span>
                            <span className="text-muted-foreground"> at </span>
                            <span className="font-semibold text-foreground">
                              {format(new Date(`2000-01-01T${scheduleTime}`), "h:mm a")}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices Card */}
          <Card className="overflow-hidden bg-gradient-to-br from-blue-500/5 to-violet-500/5 border-blue-500/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Best Practices</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Maximize success rates and avoid spam flagging
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSpamPracticesOpen(true)}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                    >
                      View Guide
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Spam Flagging Best Practices Modal */}
      <Dialog open={isSpamPracticesOpen} onOpenChange={setIsSpamPracticesOpen}>
        <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-500" />
              </div>
              Spam Flagging Best Practices
            </DialogTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Follow these guidelines to optimize your calling strategy for better success rates.
            </p>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {[
              {
                icon: TrendingUp,
                title: "Call Volume Management",
                color: "blue",
                items: [
                  "Start with low call volumes and gradually increase over time",
                  "Avoid sending large batches of calls all at once",
                  "Spread calls throughout the day rather than in concentrated bursts",
                  "Monitor call completion rates and adjust volume accordingly"
                ]
              },
              {
                icon: Clock,
                title: "Call Timing",
                color: "purple",
                items: [
                  "Respect local time zones and calling hours (typically 8 AM - 9 PM)",
                  "Avoid calling during holidays and weekends unless necessary",
                  "Space out calls to the same recipient over multiple days",
                  "Consider time-of-day patterns for your target audience"
                ]
              },
              {
                icon: Users,
                title: "Recipient Management",
                color: "green",
                items: [
                  "Only call recipients who have opted in or have an existing relationship",
                  "Maintain a \"Do Not Call\" list and respect opt-outs immediately",
                  "Verify phone numbers before calling to reduce invalid number attempts",
                  "Remove duplicate entries and invalid numbers from your list"
                ]
              },
              {
                icon: MessageSquare,
                title: "Call Quality & Content",
                color: "orange",
                items: [
                  "Ensure your agent provides clear, valuable information",
                  "Allow recipients to easily opt-out or end the call",
                  "Avoid aggressive or misleading messaging",
                  "Personalize calls when possible using recipient data"
                ]
              },
              {
                icon: Shield,
                title: "Compliance",
                color: "red",
                items: [
                  "Comply with TCPA (Telephone Consumer Protection Act) regulations",
                  "Obtain proper consent before making calls",
                  "Identify your business clearly at the start of calls",
                  "Maintain records of consent and call logs for compliance"
                ]
              },
              {
                icon: BarChart3,
                title: "Monitoring & Optimization",
                color: "indigo",
                items: [
                  "Track call success rates, answer rates, and completion rates",
                  "Monitor for patterns that might trigger spam flags",
                  "Adjust your strategy based on performance metrics",
                  "Test different approaches and measure results"
                ]
              }
            ].map((section, index) => {
              const Icon = section.icon;
              const colorClasses = {
                blue: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
                purple: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
                green: "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400",
                orange: "bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400",
                red: "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400",
                indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
              }[section.color];

              return (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl border flex-shrink-0 ${colorClasses}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="font-semibold text-base">{section.title}</h3>
                      <ul className="space-y-2">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                            <div className={`h-1.5 w-1.5 rounded-full mt-2 ${colorClasses?.split(' ')[0]?.replace('/10', '')}`} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Phone Number Modal */}
      <AddPhoneNumberModal
        open={isPhoneNumberModalOpen}
        onOpenChange={setIsPhoneNumberModalOpen}
        onAdd={handleAddManualPhoneNumber}
      />
    </div>
  );
}
