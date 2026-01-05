import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings, ChevronDown, Plus, X, PhoneForwarded, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EscalationRuleSettings } from "@/components/assistants/EscalationRulesPanel";
import type { HumanTransferRule } from "@/types/assistant";
import { PRIMARY_OUTCOMES } from "@/constants/outcomes";

const DEFAULT_ESCALATION_DESCRIPTION = `Transfer the conversation to a human agent when appropriate.
Call this function when:
- Direct requests: "I want to speak to a human", "Connect me with a representative", "Transfer me to an agent"
- Technical limitations: The user needs something beyond your capabilities
- Complex issues: Problems requiring human judgment or access to systems beyond your reach

Before calling this function, try to assist the user first if the request is within your capabilities.

Do not call this function when:
- You can answer basic information requests yourself
- You can complete simple tasks within your capabilities
- The user hasn't explicitly requested human assistance for complex issues

Human operators available for transfer:
[transfer rules will be populated at runtime]

EXAMPLE FLOWS:

Example 1 (explicit request):
User: "I want to talk to a real person instead of an AI. Please connect me to a human agent."
Assistant: "I understand you'd prefer to speak with a human agent. I'm arranging that connection for you now, and a human representative will assist you shortly."
[transfer_to_number function called]

Example 2 (technical limitation):
User: "I need to change my billing address and payment method for my order #12345."
Assistant: "I understand you need to update your billing information. Since this requires accessing your account details, I'll connect you with a human representative who can help you with that change safely."
[transfer_to_number function called]

Example 3 (DO NOT call):
User: "What's your refund policy?"
Assistant: "Our standard refund policy allows returns within 30 days of purchase with a receipt. Would you like more specific information about a particular product or situation?"`;

interface CallOutcomesStepProps {
  primaryOutcome?: string;
  onPrimaryOutcomeChange?: (value: string) => void;
  primaryOutcomes?: string[];
  onPrimaryOutcomesChange?: (values: string[]) => void;
  escalationRuleSettings?: EscalationRuleSettings;
  onEscalationRuleSettingsChange?: (settings: EscalationRuleSettings) => void;
  successKeywords?: string[];
  onSuccessKeywordsChange?: (keywords: string[]) => void;
  failureKeywords?: string[];
  onFailureKeywordsChange?: (keywords: string[]) => void;
  showValidationErrors?: boolean;
}

export function CallOutcomesStep({
  primaryOutcome = '',
  onPrimaryOutcomeChange,
  primaryOutcomes: propPrimaryOutcomes,
  onPrimaryOutcomesChange,
  escalationRuleSettings,
  onEscalationRuleSettingsChange,
  successKeywords = [],
  onSuccessKeywordsChange,
  failureKeywords = [],
  onFailureKeywordsChange,
  showValidationErrors = false,
}: CallOutcomesStepProps) {
  // Support both old single outcome and new multiple outcomes
  const [internalPrimaryOutcomes, setInternalPrimaryOutcomes] = useState<string[]>(primaryOutcome ? [primaryOutcome] : []);
  const primaryOutcomes = propPrimaryOutcomes !== undefined ? propPrimaryOutcomes : internalPrimaryOutcomes;
  const setPrimaryOutcomes = onPrimaryOutcomesChange || setInternalPrimaryOutcomes;
  
  // Sync with old primaryOutcome prop for backward compatibility
  useEffect(() => {
    if (primaryOutcome && !primaryOutcomes.includes(primaryOutcome)) {
      setPrimaryOutcomes([primaryOutcome]);
    } else if (!primaryOutcome && primaryOutcomes.length > 0 && onPrimaryOutcomeChange) {
      // If primaryOutcome is cleared, clear the first outcome
      const newOutcomes = primaryOutcomes.slice(1);
      setPrimaryOutcomes(newOutcomes);
      if (newOutcomes.length > 0 && onPrimaryOutcomeChange) {
        onPrimaryOutcomeChange(newOutcomes[0]);
      }
    }
  }, [primaryOutcome]);
  
  const toggleOutcome = (outcomeValue: string) => {
    // Check if outcome is disabled (coming soon)
    const outcome = PRIMARY_OUTCOMES.find(o => o.value === outcomeValue);
    if (outcome?.comingSoon) {
      return; // Don't allow selection of coming soon outcomes
    }
    
    const newOutcomes = primaryOutcomes.includes(outcomeValue)
      ? primaryOutcomes.filter(v => v !== outcomeValue)
      : [...primaryOutcomes, outcomeValue];
    setPrimaryOutcomes(newOutcomes);
    // Update old prop for backward compatibility
    if (onPrimaryOutcomeChange && newOutcomes.length > 0) {
      onPrimaryOutcomeChange(newOutcomes[0]);
    }
  };
  const [isEscalationOpen, setIsEscalationOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isFailureOpen, setIsFailureOpen] = useState(false);
  const originalDescriptionRef = useRef<string | null>(null);
  const [isShowingDefault, setIsShowingDefault] = useState(false);
  
  const [internalEscalationSettings, setInternalEscalationSettings] = useState<EscalationRuleSettings>({
    name: 'transfer_to_number',
    description: '',
    disableInterruptions: false,
    humanTransferRules: [],
    escalation_keywords: [],
  });

  const [internalSuccessKeywords, setInternalSuccessKeywords] = useState<string[]>([]);
  const [internalFailureKeywords, setInternalFailureKeywords] = useState<string[]>([]);

  // Use props if provided, otherwise use internal state
  const currentSuccessKeywords = onSuccessKeywordsChange ? (successKeywords || []) : internalSuccessKeywords;
  const currentFailureKeywords = onFailureKeywordsChange ? (failureKeywords || []) : internalFailureKeywords;
  
  const setSuccessKeywords = onSuccessKeywordsChange || setInternalSuccessKeywords;
  const setFailureKeywords = onFailureKeywordsChange || setInternalFailureKeywords;

  const currentEscalationSettings = escalationRuleSettings || internalEscalationSettings;
  const setEscalationSettings = onEscalationRuleSettingsChange || setInternalEscalationSettings;

  const handleEscalationUpdate = (updates: Partial<EscalationRuleSettings>) => {
    setEscalationSettings({
      ...currentEscalationSettings,
      ...updates,
    });
  };

  return (
    <div className="space-y-6">
      {/* Primary Goals Section */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Goals</CardTitle>
          <CardDescription>
            Define what success means for your agent's calls. You can select multiple goals. We'll automatically analyze conversations to track outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="primary-outcomes">
              Primary Outcomes <span className="text-destructive">*</span>
            </Label>
            <div className="mt-2 space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-3">
              {PRIMARY_OUTCOMES.map((outcome) => {
                const Icon = outcome.icon;
                const isSelected = primaryOutcomes.includes(outcome.value);
                const isDisabled = outcome.comingSoon === true;
                return (
                  <div
                    key={outcome.value}
                    className={`flex items-center space-x-3 p-2 rounded-md ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-muted/50 cursor-pointer'}`}
                    onClick={(e) => {
                      // Prevent double-toggling if clicking directly on checkbox
                      if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
                        return;
                      }
                      if (!isDisabled) {
                        toggleOutcome(outcome.value);
                      }
                    }}
                  >
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        id={`wizard-outcome-${outcome.value}`}
                        checked={isSelected}
                        disabled={isDisabled}
                        onCheckedChange={(checked) => {
                          if (!isDisabled) {
                            toggleOutcome(outcome.value);
                          }
                        }}
                      />
                    </div>
                    <label
                      htmlFor={`wizard-outcome-${outcome.value}`}
                      className={`flex-1 flex items-center gap-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      onClick={(e) => {
                        // Prevent default label behavior and let row handler take over
                        e.preventDefault();
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{outcome.label}</span>
                      <Badge variant={outcome.type === 'support' ? 'default' : outcome.type === 'sales' ? 'secondary' : 'outline'} className="text-xs">
                        {outcome.type}
                      </Badge>
                      {isDisabled && (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Coming Soon
                        </Badge>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
            {showValidationErrors && primaryOutcomes.length === 0 && (
              <p className="text-xs text-destructive mt-1">At least one primary goal is required</p>
            )}
            {primaryOutcomes.length > 0 && (
              <div className="mt-3 space-y-2">
                <Label>Selected Goals</Label>
                <div className="flex flex-wrap gap-2">
                  {primaryOutcomes.map(outcomeValue => {
                    const outcome = PRIMARY_OUTCOMES.find(o => o.value === outcomeValue);
                    if (!outcome) return null;
                    return (
                      <Badge
                        key={outcomeValue}
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                      >
                        {outcome.label}
                        <button
                          onClick={() => toggleOutcome(outcomeValue)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              These are the main goals you want your agent to achieve during calls.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Escalation Rules Section */}
      <Card>
        <Collapsible open={isEscalationOpen} onOpenChange={setIsEscalationOpen}>
          <CardHeader>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle className="mb-2">Escalation Rules</CardTitle>
                  <CardDescription>
                    Configure transfer behaviors and escalation triggers
                  </CardDescription>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isEscalationOpen && "rotate-180"
                  )}
                />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Configuration */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="escalation-name">Name</Label>
                  <Input
                    id="escalation-name"
                    value={currentEscalationSettings.name || "transfer_to_number"}
                    onChange={(e) => handleEscalationUpdate({ name: e.target.value })}
                    placeholder="Tool name"
                    className="mt-1.5"
                    disabled
                    readOnly
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="escalation-description">Description (optional)</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (isShowingDefault) {
                          // Restore original
                          handleEscalationUpdate({ 
                            description: originalDescriptionRef.current || "" 
                          });
                          setIsShowingDefault(false);
                          originalDescriptionRef.current = null;
                        } else {
                          // Show default - save current description first
                          originalDescriptionRef.current = currentEscalationSettings.description || null;
                          handleEscalationUpdate({ description: DEFAULT_ESCALATION_DESCRIPTION });
                          setIsShowingDefault(true);
                        }
                      }}
                      className="h-7 text-xs"
                    >
                      {isShowingDefault ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                          Restore original
                        </>
                      ) : (
                        "Show default"
                      )}
                    </Button>
                  </div>
                  <Textarea
                    id="escalation-description"
                    value={currentEscalationSettings.description || ""}
                    onChange={(e) => {
                      handleEscalationUpdate({ description: e.target.value });
                      // If user manually edits away from default, reset the default state
                      if (isShowingDefault && e.target.value.trim() !== DEFAULT_ESCALATION_DESCRIPTION.trim()) {
                        setIsShowingDefault(false);
                        originalDescriptionRef.current = null;
                      }
                    }}
                    placeholder="Describe when and how to use the escalation tool"
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>
                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox
                    id="disable-interruptions"
                    checked={currentEscalationSettings.disableInterruptions || false}
                    onCheckedChange={(checked) => handleEscalationUpdate({ disableInterruptions: checked === true })}
                    className="mt-1"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="disable-interruptions" className="cursor-pointer">
                      Disable interruptions
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Disable interruptions while the escalation tool is running.
                    </p>
                  </div>
                </div>
              </div>

              {/* Human Transfer Rules */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Human Transfer Rules</h4>
                    <p className="text-xs text-muted-foreground">
                      Define conditions for transferring to human operators
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      const newRule: HumanTransferRule = {
                        id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        phoneNumber: "",
                        condition: "",
                        destinationType: "phone_number",
                      };
                      handleEscalationUpdate({
                        humanTransferRules: [...(currentEscalationSettings.humanTransferRules || []), newRule],
                      });
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>

                {(!currentEscalationSettings.humanTransferRules || currentEscalationSettings.humanTransferRules.length === 0) ? (
                  <div className="text-center py-8 rounded-xl border border-dashed border-border/60 bg-secondary/10">
                    <p className="text-sm text-muted-foreground">No human transfer rules configured</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {currentEscalationSettings.humanTransferRules.map((rule) => (
                      <div key={rule.id} className="relative bg-secondary/30 rounded-lg border border-border p-4 space-y-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            handleEscalationUpdate({
                              humanTransferRules: (currentEscalationSettings.humanTransferRules || []).filter((r) => r.id !== rule.id),
                            });
                          }}
                          className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-background border border-border shadow-sm hover:bg-destructive hover:text-white"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                        <div>
                          <Label>
                            Phone Number <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative mt-1.5">
                            <Input
                              placeholder="+15551234567"
                              value={rule.phoneNumber}
                              onChange={(e) => {
                                handleEscalationUpdate({
                                  humanTransferRules: (currentEscalationSettings.humanTransferRules || []).map((r) =>
                                    r.id === rule.id ? { ...r, phoneNumber: e.target.value } : r
                                  ),
                                });
                              }}
                              className={cn(
                                "pl-9",
                                showValidationErrors && !rule.phoneNumber.trim() && "border-destructive focus-visible:ring-destructive"
                              )}
                              required
                            />
                            <PhoneForwarded className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                          </div>
                          {showValidationErrors && !rule.phoneNumber.trim() && (
                            <p className="text-xs text-destructive mt-1">Phone number is required</p>
                          )}
                        </div>
                        <div>
                          <Label>
                            Condition <span className="text-destructive">*</span>
                          </Label>
                          <Textarea
                            placeholder="Enter the condition for transferring to this phone number"
                            value={rule.condition}
                            onChange={(e) => {
                              handleEscalationUpdate({
                                humanTransferRules: (currentEscalationSettings.humanTransferRules || []).map((r) =>
                                  r.id === rule.id ? { ...r, condition: e.target.value } : r
                                ),
                              });
                            }}
                            className={cn(
                              "mt-1.5 min-h-[80px]",
                              showValidationErrors && !rule.condition.trim() && "border-destructive focus-visible:ring-destructive"
                            )}
                            required
                          />
                          {showValidationErrors && !rule.condition.trim() && (
                            <p className="text-xs text-destructive mt-1">Condition is required</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Success Indicators Section */}
      {/* <Card>
        <Collapsible open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
          <CardHeader>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle className="mb-2">Success Indicators</CardTitle>
                  <CardDescription>
                    Optional: Add keywords that help identify successful calls. Our AI will automatically analyze conversations, but you can add specific words to look for.
                  </CardDescription>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isSuccessOpen && "rotate-180"
                  )}
                />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setSuccessKeywords(currentSuccessKeywords.length === 0 ? [''] : [...currentSuccessKeywords, '']);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Keyword
                  </Button>
                </div>
                {currentSuccessKeywords.length === 0 ? (
                  <div className="text-center py-4 rounded-lg border border-dashed border-border/60 bg-secondary/10">
                    <p className="text-xs text-muted-foreground">No success keywords configured</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentSuccessKeywords.map((keyword, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={keyword}
                          onChange={(e) => {
                            const updated = [...currentSuccessKeywords];
                            updated[index] = e.target.value;
                            setSuccessKeywords(updated);
                          }}
                          placeholder="Enter keyword"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const filtered = currentSuccessKeywords.filter((_, i) => i !== index);
                            setSuccessKeywords(filtered);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card> */}

      {/* Failure Indicators Section */}
      {/* <Card>
        <Collapsible open={isFailureOpen} onOpenChange={setIsFailureOpen}>
          <CardHeader>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle className="mb-2">Failure Indicators</CardTitle>
                  <CardDescription>
                    Optional: Add keywords that help identify unsuccessful calls. Our AI will automatically analyze conversations, but you can add specific words to look for.
                  </CardDescription>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isFailureOpen && "rotate-180"
                  )}
                />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setFailureKeywords(currentFailureKeywords.length === 0 ? [''] : [...currentFailureKeywords, '']);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Keyword
                  </Button>
                </div>
                {currentFailureKeywords.length === 0 ? (
                  <div className="text-center py-4 rounded-lg border border-dashed border-border/60 bg-secondary/10">
                    <p className="text-xs text-muted-foreground">No failure keywords configured</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {currentFailureKeywords.map((keyword, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={keyword}
                          onChange={(e) => {
                            const updated = [...currentFailureKeywords];
                            updated[index] = e.target.value;
                            setFailureKeywords(updated);
                          }}
                          placeholder="Enter keyword"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const filtered = currentFailureKeywords.filter((_, i) => i !== index);
                            setFailureKeywords(filtered);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card> */}
    </div>
  );
}

