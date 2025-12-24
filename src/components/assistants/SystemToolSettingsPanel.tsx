import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, PhoneForwarded, User, GitBranch, Settings2, HelpCircle, Trash2, Loader2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { agentsApi, type Agent } from "@/lib/api";
import type { SystemToolSetting, TransferRule, HumanTransferRule, SystemToolKey } from "@/types/assistant";

type SystemToolSettingsPanelProps = {
  toolKey: SystemToolKey;
  settings: SystemToolSetting;
  onUpdate: (updates: Partial<SystemToolSetting>) => void;
  onClose: () => void;
  onSave?: () => void;
  saving?: boolean;
  currentAgentId?: string;
};

export const SystemToolSettingsPanel: React.FC<SystemToolSettingsPanelProps> = ({
  toolKey,
  settings,
  onUpdate,
  onClose,
  onSave,
  saving = false,
  currentAgentId,
}) => {
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  // Fetch agents when transfer_to_agent tool is selected
  useEffect(() => {
    if (toolKey === "transfer_to_agent") {
      const fetchAgents = async () => {
        setLoadingAgents(true);
        try {
          const response = await agentsApi.list({ page_size: 100 });
          if (response.data && Array.isArray(response.data)) {
            // Filter out the current agent
            const filteredAgents = currentAgentId
              ? response.data.filter(agent => agent.id !== currentAgentId)
              : response.data;
            setAvailableAgents(filteredAgents);
          }
        } catch (error) {
          console.error("Failed to fetch agents:", error);
          setAvailableAgents([]);
        } finally {
          setLoadingAgents(false);
        }
      };
      fetchAgents();
    }
  }, [toolKey, currentAgentId]);
  const addTransferRule = () => {
    const newRule: TransferRule = {
      id: crypto.randomUUID(),
      agent: "",
      condition: "",
      delayMs: 0,
      transferMessage: "",
      enableFirstMessage: false,
    };
    onUpdate({
      transferRules: [...(settings.transferRules || []), newRule],
    });
  };

  const updateTransferRule = (id: string, updates: Partial<TransferRule>) => {
    onUpdate({
      transferRules: (settings.transferRules || []).map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    });
  };

  const removeTransferRule = (id: string) => {
    onUpdate({
      transferRules: (settings.transferRules || []).filter((r) => r.id !== id),
    });
  };

  const addHumanTransferRule = () => {
    const newRule: HumanTransferRule = {
      id: crypto.randomUUID(),
      phoneNumber: "",
      condition: "",
      transferType: "conference",
      destinationType: "phone_number",
    };
    onUpdate({
      humanTransferRules: [...(settings.humanTransferRules || []), newRule],
    });
  };

  const updateHumanTransferRule = (id: string, updates: Partial<HumanTransferRule>) => {
    onUpdate({
      humanTransferRules: (settings.humanTransferRules || []).map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    });
  };

  const removeHumanTransferRule = (id: string) => {
    onUpdate({
      humanTransferRules: (settings.humanTransferRules || []).filter((r) => r.id !== id),
    });
  };

  const clearAllTransferRules = () => {
    onUpdate({
      transferRules: [],
    });
  };

  const clearAllHumanTransferRules = () => {
    onUpdate({
      humanTransferRules: [],
    });
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border animate-in slide-in-from-right duration-300 shadow-2xl">
      <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Settings2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Edit system tool</h3>
            <p className="text-xs text-muted-foreground">
              {toolKey === "transfer_to_agent" || toolKey === "transfer_to_number" 
                ? "Configure transfer behaviors" 
                : "Configure tool settings"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-secondary/80">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8 pb-24">
          {/* Configuration Section */}
          <section className="space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">Configuration</h4>
              <p className="text-xs text-muted-foreground">
                Describe to the LLM how and when to use the tool.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Name</label>
                <Input
                  value={settings.name || ""}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  className="bg-secondary/20 border-transparent focus:border-primary/30"
                  placeholder="Tool name"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    Show Default
                  </Button>
                </div>
                <Textarea
                  value={settings.description || ""}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  className="bg-secondary/20 border-transparent focus:border-primary/30 min-h-[100px] resize-none"
                  placeholder="Leave blank to use the default optimized LLM prompt."
                />
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox
                  id="disable-interruptions"
                  checked={settings.disableInterruptions || false}
                  onCheckedChange={(checked) => onUpdate({ disableInterruptions: checked === true })}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="disable-interruptions"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Disable interruptions
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Select this box to disable interruptions while the tool is running.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Transfer Rules Section - Only for transfer_to_agent */}
          {toolKey === "transfer_to_agent" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between bg-secondary/30 p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-white border border-border">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    Transfer Rules
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px]">
                          <p>Define the conditions for transferring to different agents.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Define the conditions for transferring to different agents.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(settings.transferRules || []).length > 0 && (
                  <Button 
                    onClick={clearAllTransferRules} 
                    variant="outline" 
                    size="sm" 
                    className="bg-white hover:bg-destructive/10 hover:text-destructive hover:border-destructive h-8"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear All
                  </Button>
                )}
                <Button onClick={addTransferRule} variant="outline" size="sm" className="bg-white hover:bg-secondary/50 h-8">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Rule
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {(settings.transferRules || []).length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-dashed border-border/60 bg-secondary/10">
                  <p className="text-sm text-muted-foreground">No transfer rules configured</p>
                </div>
              ) : (
                (settings.transferRules || []).map((rule) => (
                  <div key={rule.id} className="group relative bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTransferRule(rule.id)}
                      className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Agent</label>
                        {loadingAgents ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Loading agents...</span>
                          </div>
                        ) : (
                          <Select
                            value={rule.agent}
                            onValueChange={(value) => updateTransferRule(rule.id, { agent: value })}
                          >
                            <SelectTrigger className="bg-secondary/20 border-transparent focus:border-primary/30 h-9 text-sm">
                              <SelectValue placeholder="Select an agent" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAgents.length === 0 ? (
                                <SelectItem value="" disabled>No agents available</SelectItem>
                              ) : (
                                availableAgents.map((agent) => (
                                  <SelectItem key={agent.id} value={agent.id || ""}>
                                    {agent.name || `Agent ${agent.id}`}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Condition</label>
                        <Textarea
                          placeholder="Enter the condition for transferring to this agent"
                          value={rule.condition}
                          onChange={(e) => updateTransferRule(rule.id, { condition: e.target.value })}
                          className="bg-secondary/20 border-transparent focus:border-primary/30 min-h-[80px] text-sm resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Delay before transfer (milliseconds)</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={rule.delayMs}
                          onChange={(e) => updateTransferRule(rule.id, { delayMs: parseInt(e.target.value) || 0 })}
                          className="bg-secondary/20 border-transparent focus:border-primary/30 h-9 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Transfer Message</label>
                        <Textarea
                          placeholder="Enter the message to play before transferring (optional)."
                          value={rule.transferMessage}
                          onChange={(e) => updateTransferRule(rule.id, { transferMessage: e.target.value })}
                          className="bg-secondary/20 border-transparent focus:border-primary/30 min-h-[80px] text-sm resize-none"
                        />
                      </div>
                      <div className="flex items-start space-x-3 pt-2">
                        <Checkbox
                          id={`enable-first-message-${rule.id}`}
                          checked={rule.enableFirstMessage || false}
                          onCheckedChange={(checked) => updateTransferRule(rule.id, { enableFirstMessage: checked === true })}
                          className="mt-1"
                        />
                        <div className="space-y-1">
                          <label
                            htmlFor={`enable-first-message-${rule.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            Enable First Message
                          </label>
                          <p className="text-xs text-muted-foreground">
                            Play the transferred agent's first message after transfer
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
          )}

          {/* Human Transfer Rules Section - Only for transfer_to_number */}
          {toolKey === "transfer_to_number" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between bg-secondary/30 p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-white border border-border">
                  <User className="h-4 w-4 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    Human Transfer Rules
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px]">
                          <p>Define the conditions for transferring to human operators.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Define the conditions for transferring to human operators.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(settings.humanTransferRules || []).length > 0 && (
                  <Button 
                    onClick={clearAllHumanTransferRules} 
                    variant="outline" 
                    size="sm" 
                    className="bg-white hover:bg-destructive/10 hover:text-destructive hover:border-destructive h-8"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Clear All
                  </Button>
                )}
                <Button onClick={addHumanTransferRule} variant="outline" size="sm" className="bg-white hover:bg-secondary/50 h-8">
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Rule
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {(settings.humanTransferRules || []).length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-dashed border-border/60 bg-secondary/10">
                  <p className="text-sm text-muted-foreground">No human transfer rules configured</p>
                </div>
              ) : (
                (settings.humanTransferRules || []).map((rule) => (
                  <div key={rule.id} className="group relative bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHumanTransferRule(rule.id)}
                      className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Destination type</label>
                        <Select
                          value={rule.destinationType || "phone_number"}
                          onValueChange={(value) => updateHumanTransferRule(rule.id, { destinationType: value })}
                        >
                          <SelectTrigger className="bg-secondary/20 border-transparent focus:border-primary/30 h-9 text-sm">
                            <SelectValue placeholder="Select destination type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phone_number">Phone Number</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                        <div className="relative">
                          <Input
                            placeholder="+15551234567"
                            value={rule.phoneNumber}
                            onChange={(e) => updateHumanTransferRule(rule.id, { phoneNumber: e.target.value })}
                            className="bg-secondary/20 border-transparent focus:border-primary/30 h-9 text-sm pl-9"
                          />
                          <PhoneForwarded className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1.5 block">Condition</label>
                        <div className="relative">
                          <Textarea
                            placeholder="Enter the condition for transferring to this phone number"
                            value={rule.condition}
                            onChange={(e) => updateHumanTransferRule(rule.id, { condition: e.target.value })}
                            className="bg-secondary/20 border-transparent focus:border-primary/30 min-h-[100px] text-sm resize-none"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5">Type {"{{"} to add variables</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
          )}
        </div>
      </ScrollArea>
      
      {/* Save Button Footer */}
      {onSave && (
        <div className="p-4 border-t border-border bg-secondary/20 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
