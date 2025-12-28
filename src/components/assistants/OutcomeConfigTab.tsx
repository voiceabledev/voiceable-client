import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Save, Trash2, Plus, X, ChevronDown, Settings } from 'lucide-react';
import { useOutcomeDefinition } from '@/hooks/assistants/useOutcomeDefinition';
import { useToast } from '@/hooks/use-toast';
import type { OutcomeDefinition } from '@/types/outcomes';
import { EscalationRulesPanel, type EscalationRuleSettings } from './EscalationRulesPanel';

interface OutcomeConfigTabProps {
  agentId: string;
  onAgentDataChange?: () => void | Promise<void>;
  onOpenEscalationPanel?: () => void;
  escalationRuleSettings?: EscalationRuleSettings;
  onEscalationRuleSettingsChange?: (settings: EscalationRuleSettings) => void;
  onSaveEscalationRules?: () => Promise<void>;
  onEnableTransferToNumber?: (settings: EscalationRuleSettings) => void;
}

const PRIMARY_OUTCOMES = [
  { value: 'issue_resolved', label: 'Issue Resolved', type: 'support' },
  { value: 'meeting_booked', label: 'Meeting Booked', type: 'sales' },
  { value: 'lead_qualified', label: 'Lead Qualified', type: 'sales' },
  { value: 'information_provided', label: 'Information Provided', type: 'general' },
  { value: 'appointment_scheduled', label: 'Appointment Scheduled', type: 'sales' },
  { value: 'order_placed', label: 'Order Placed', type: 'sales' },
  { value: 'complaint_resolved', label: 'Complaint Resolved', type: 'support' },
];

export default function OutcomeConfigTab({ 
  agentId, 
  onAgentDataChange, 
  onOpenEscalationPanel,
  escalationRuleSettings: externalEscalationRuleSettings,
  onEscalationRuleSettingsChange,
  onSaveEscalationRules,
  onEnableTransferToNumber,
}: OutcomeConfigTabProps) {
  const { toast } = useToast();
  const {
    outcomeDefinition,
    loading,
    saving,
    fetchOutcomeDefinition,
    createOutcomeDefinition,
    updateOutcomeDefinition,
    deleteOutcomeDefinition,
  } = useOutcomeDefinition(agentId);

  const [primaryOutcome, setPrimaryOutcome] = useState<string>('');
  const [secondaryOutcomes, setSecondaryOutcomes] = useState<string[]>([]);
  const [successKeywords, setSuccessKeywords] = useState<string[]>(['']);
  const [failureKeywords, setFailureKeywords] = useState<string[]>(['']);
  
  // Escalation rules panel state - use external if provided, otherwise use internal state
  const [internalEscalationRuleSettings, setInternalEscalationRuleSettings] = useState<EscalationRuleSettings>({
    name: 'transfer_to_number',
    description: '',
    disableInterruptions: false,
    humanTransferRules: [],
    escalation_keywords: [],
  });
  
  const escalationRuleSettings = externalEscalationRuleSettings || internalEscalationRuleSettings;
  const setEscalationRuleSettings = onEscalationRuleSettingsChange || setInternalEscalationRuleSettings;
  
  // Collapsible state for sections
  const [isPrimaryOpen, setIsPrimaryOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isFailureOpen, setIsFailureOpen] = useState(false);

  useEffect(() => {
    if (agentId) {
      fetchOutcomeDefinition();
    }
  }, [agentId, fetchOutcomeDefinition]);

  useEffect(() => {
    if (outcomeDefinition) {
      setPrimaryOutcome(outcomeDefinition.primary_outcome || '');
      setSecondaryOutcomes(outcomeDefinition.secondary_outcomes || []);
      
      // Handle keywords - ensure we have at least one empty string if array is empty
      // This is needed because empty arrays [] are truthy, so we need to check length
      const successKws = outcomeDefinition.success_conditions?.keywords;
      setSuccessKeywords(Array.isArray(successKws) && successKws.length > 0 ? successKws : ['']);
      
      const failureKws = outcomeDefinition.failure_conditions?.failure_keywords;
      setFailureKeywords(Array.isArray(failureKws) && failureKws.length > 0 ? failureKws : ['']);
      
      // Load escalation rule settings if they exist
      if (outcomeDefinition.escalation_rules) {
        const escalationKws = outcomeDefinition.escalation_rules?.escalation_keywords;
        const settings: EscalationRuleSettings = {
          name: outcomeDefinition.escalation_rules.name || 'transfer_to_number',
          description: outcomeDefinition.escalation_rules.description || '',
          disableInterruptions: outcomeDefinition.escalation_rules.disableInterruptions || false,
          humanTransferRules: outcomeDefinition.escalation_rules.humanTransferRules || [],
          escalation_keywords: Array.isArray(escalationKws) && escalationKws.length > 0 ? escalationKws : [],
        };
        setEscalationRuleSettings(settings);
      } else {
        // Reset to defaults if no escalation rules
        setEscalationRuleSettings({
          name: 'transfer_to_number',
          description: '',
          disableInterruptions: false,
          humanTransferRules: [],
          escalation_keywords: [],
        });
      }
    } else {
      // Reset to defaults
      setPrimaryOutcome('');
      setSecondaryOutcomes([]);
      setSuccessKeywords(['']);
      setFailureKeywords(['']);
    }
  }, [outcomeDefinition, setEscalationRuleSettings]);

  const handleSave = async () => {
    if (!primaryOutcome) {
      toast({
        title: 'Validation Error',
        description: 'Please select a primary outcome.',
        variant: 'destructive',
      });
      return;
    }

    const data = {
      primary_outcome: primaryOutcome,
      secondary_outcomes: secondaryOutcomes,
      success_conditions: {
        keywords: successKeywords.filter(k => k.trim()),
      },
      failure_conditions: {
        failure_keywords: failureKeywords.filter(k => k.trim()),
      },
      escalation_rules: {
        escalation_keywords: escalationRuleSettings.escalation_keywords?.filter(k => k.trim()) || [],
        name: escalationRuleSettings.name,
        description: escalationRuleSettings.description,
        disableInterruptions: escalationRuleSettings.disableInterruptions,
        humanTransferRules: escalationRuleSettings.humanTransferRules,
      },
    };

    console.log('Saving outcome definition:', { agentId, outcomeDefinition: outcomeDefinition?.id, data });

    try {
      if (outcomeDefinition) {
        console.log('Updating existing outcome definition');
        const result = await updateOutcomeDefinition(data);
        console.log('Update result:', result);
      } else {
        console.log('Creating new outcome definition');
        const result = await createOutcomeDefinition(data);
        console.log('Create result:', result);
      }
      
      // Enable transfer_to_number system tool if escalation rules have human transfer rules
      // Check if we have any human transfer rules configured with phone numbers
      const hasHumanTransferRules = escalationRuleSettings.humanTransferRules && 
                                    escalationRuleSettings.humanTransferRules.length > 0 &&
                                    escalationRuleSettings.humanTransferRules.some(rule => 
                                      rule.phoneNumber && rule.phoneNumber.trim() !== ''
                                    );
      
      if (hasHumanTransferRules && onEnableTransferToNumber) {
        await onEnableTransferToNumber(escalationRuleSettings);
      }
      
      // Refetch agent data to update webhook tools
      // Add a small delay to allow backend to sync webhook tools
      if (onAgentDataChange) {
        // Use Promise-based delay to allow backend to finish syncing
        await new Promise(resolve => setTimeout(resolve, 500));
        await onAgentDataChange();
      }
    } catch (error: unknown) {
      // Error handled in hook, but log for debugging
      console.error('Error saving outcome definition:', error);
      const errorMessage = (error as { response?: { data?: { errors?: string | string[] } }; message?: string })?.response?.data?.errors || 
                          (error as { message?: string })?.message || 
                          'Failed to save success criteria';
      toast({
        title: 'Error',
        description: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!outcomeDefinition) return;
    if (!confirm('Are you sure you want to delete the success criteria for this agent?')) return;

    try {
      await deleteOutcomeDefinition();
      
      // Explicitly reset form fields immediately
      setPrimaryOutcome('');
      setSecondaryOutcomes([]);
      setSuccessKeywords(['']);
      setFailureKeywords(['']);
      
      // Refetch agent data to update webhook tools
      // Add a small delay to allow backend to sync webhook tools
      if (onAgentDataChange) {
        // Use Promise-based delay to allow backend to finish syncing
        await new Promise(resolve => setTimeout(resolve, 500));
        await onAgentDataChange();
      }
      // Also refetch outcome definition to ensure UI is in sync
      await fetchOutcomeDefinition();
    } catch (error) {
      // Error handled in hook
    }
  };

  const addKeyword = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, '']);
  };

  const updateKeyword = (index: number, value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeKeyword = (index: number, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const selectedOutcomeType = PRIMARY_OUTCOMES.find(o => o.value === primaryOutcome)?.type || 'general';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Success Criteria</h2>
          <p className="text-muted-foreground">
            Define what success and failure mean for this agent's conversations
          </p>
        </div>
        <div className="flex gap-2">
          {outcomeDefinition && (
            <Button variant="outline" onClick={handleDelete} disabled={saving}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving || !primaryOutcome}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <Collapsible open={isPrimaryOpen} onOpenChange={setIsPrimaryOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="mb-2">Primary Outcome</CardTitle>
                  <CardDescription>
                    The main goal for this agent's conversations
                  </CardDescription>
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isPrimaryOpen ? 'transform rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primary-outcome">Primary Outcome</Label>
            <Select value={primaryOutcome} onValueChange={setPrimaryOutcome}>
              <SelectTrigger id="primary-outcome">
                <SelectValue placeholder="Select primary outcome" />
              </SelectTrigger>
              <SelectContent>
                {PRIMARY_OUTCOMES.map(outcome => (
                  <SelectItem key={outcome.value} value={outcome.value}>
                    <div className="flex items-center gap-2">
                      {outcome.label}
                      <Badge variant={outcome.type === 'support' ? 'default' : outcome.type === 'sales' ? 'secondary' : 'outline'}>
                        {outcome.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedOutcomeType && (
            <div className="flex items-center gap-2">
              <Badge variant={selectedOutcomeType === 'support' ? 'default' : selectedOutcomeType === 'sales' ? 'secondary' : 'outline'}>
                {selectedOutcomeType === 'support' ? 'Support Agent' : selectedOutcomeType === 'sales' ? 'Sales Agent' : 'General Agent'}
              </Badge>
            </div>
          )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="mb-2">Success Conditions</CardTitle>
                  <CardDescription>
                    Keywords and patterns that indicate a successful conversation
                  </CardDescription>
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isSuccessOpen ? 'transform rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
          <div>
            <Label>Success Keywords</Label>
            <div className="space-y-2 mt-2">
              {successKeywords.map((keyword, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value, setSuccessKeywords)}
                    placeholder="e.g., resolved, fixed, working"
                  />
                  {successKeywords.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKeyword(index, setSuccessKeywords)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addKeyword(setSuccessKeywords)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Keyword
              </Button>
            </div>
          </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible open={isFailureOpen} onOpenChange={setIsFailureOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="mb-2">Failure Conditions</CardTitle>
                  <CardDescription>
                    Keywords and patterns that indicate a failed conversation
                  </CardDescription>
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isFailureOpen ? 'transform rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
          <div>
            <Label>Failure Keywords</Label>
            <div className="space-y-2 mt-2">
              {failureKeywords.map((keyword, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={keyword}
                    onChange={(e) => updateKeyword(index, e.target.value, setFailureKeywords)}
                    placeholder="e.g., still broken, doesn't work"
                  />
                  {failureKeywords.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKeyword(index, setFailureKeywords)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addKeyword(setFailureKeywords)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Keyword
              </Button>
            </div>
          </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="mb-2">Escalation Rules</CardTitle>
              <CardDescription>
                Configure transfer behaviors and escalation triggers
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (onOpenEscalationPanel) {
                  onOpenEscalationPanel();
                }
              }}
              className="h-8"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      {/* Escalation Rules Panel - will be rendered in parent's right panel area */}
    </div>
  );
}

