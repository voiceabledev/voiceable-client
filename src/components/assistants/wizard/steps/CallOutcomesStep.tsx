import { useState, useRef } from "react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings, ChevronDown, Plus, X, PhoneForwarded, RotateCcw, CheckCircle2, Calendar, UserCheck, Info, ShoppingCart, AlertCircle, Target, Package, Truck, RefreshCw, MessageSquare, UtensilsCrossed, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EscalationRuleSettings } from "@/components/assistants/EscalationRulesPanel";
import type { HumanTransferRule } from "@/types/assistant";

const PRIMARY_OUTCOMES = [
  // Retail/E-commerce outcomes
  { value: 'order_placed', label: 'Order Placed', type: 'sales', icon: ShoppingCart },
  { value: 'order_status_checked', label: 'Order Status Checked', type: 'support', icon: CheckCircle2 },
  { value: 'shipping_info_provided', label: 'Shipping Information Provided', type: 'support', icon: Truck },
  { value: 'tracking_provided', label: 'Tracking Provided', type: 'support', icon: Package },
  { value: 'return_initiated', label: 'Return Initiated', type: 'support', icon: RotateCcw },
  { value: 'exchange_processed', label: 'Exchange Processed', type: 'support', icon: RefreshCw },
  { value: 'refund_processed', label: 'Refund Processed', type: 'support', icon: RotateCcw },
  { value: 'product_inquiry_answered', label: 'Product Inquiry Answered', type: 'general', icon: Info },
  { value: 'inventory_checked', label: 'Inventory Checked', type: 'general', icon: Package },
  { value: 'account_updated', label: 'Account Updated', type: 'support', icon: UserCheck },
  // Restaurant outcomes
  { value: 'reservation_booked', label: 'Reservation Booked', type: 'sales', icon: Calendar },
  { value: 'reservation_updated', label: 'Reservation Updated', type: 'sales', icon: Calendar },
  { value: 'reservation_cancelled', label: 'Reservation Cancelled', type: 'sales', icon: X },
  { value: 'menu_inquiry_answered', label: 'Menu Inquiry Answered', type: 'general', icon: UtensilsCrossed },
  { value: 'special_request_handled', label: 'Special Request Handled', type: 'support', icon: CheckCircle2 },
  { value: 'location_hours_provided', label: 'Location & Hours Provided', type: 'general', icon: MapPin },
  // General outcomes
  { value: 'issue_resolved', label: 'Issue Resolved', type: 'support', icon: CheckCircle2 },
  { value: 'information_provided', label: 'Information Provided', type: 'general', icon: Info },
  { value: 'feedback_collected', label: 'Feedback Collected', type: 'general', icon: MessageSquare },
];

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
  escalationRuleSettings,
  onEscalationRuleSettingsChange,
  successKeywords = [],
  onSuccessKeywordsChange,
  failureKeywords = [],
  onFailureKeywordsChange,
  showValidationErrors = false,
}: CallOutcomesStepProps) {
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
      {/* Primary Goal Section */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Goal</CardTitle>
          <CardDescription>
            Define what success means for your agent's calls. We'll automatically analyze conversations to track outcomes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="primary-outcome">
              Primary Outcome <span className="text-destructive">*</span>
            </Label>
            <Select
              value={primaryOutcome}
              onValueChange={(value) => {
                if (onPrimaryOutcomeChange) {
                  onPrimaryOutcomeChange(value);
                }
              }}
            >
              <SelectTrigger 
                id="primary-outcome" 
                className={cn(
                  "w-full",
                  showValidationErrors && !primaryOutcome && "border-destructive focus-visible:ring-destructive"
                )}
              >
                {primaryOutcome ? (() => {
                  const selectedOutcome = PRIMARY_OUTCOMES.find(o => o.value === primaryOutcome);
                  if (selectedOutcome) {
                    const Icon = selectedOutcome.icon;
                    return (
                      <>
                        <Icon className="h-4 w-4 mr-2" />
                        <SelectValue>{selectedOutcome.label}</SelectValue>
                      </>
                    );
                  }
                  return <SelectValue placeholder="Select a primary outcome" />;
                })() : (
                  <SelectValue placeholder="Select a primary outcome" />
                )}
              </SelectTrigger>
              <SelectContent>
                {PRIMARY_OUTCOMES.map((outcome) => {
                  const Icon = outcome.icon;
                  return (
                    <SelectItem key={outcome.value} value={outcome.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{outcome.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {showValidationErrors && !primaryOutcome && (
              <p className="text-xs text-destructive mt-1">Primary outcome is required</p>
            )}
            <p className="text-xs text-muted-foreground">
              This is the main goal you want your agent to achieve during calls.
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

