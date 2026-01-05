import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Plus, X, ChevronDown, Settings, RotateCcw, Check } from 'lucide-react';
import { useOutcomeDefinition } from '@/hooks/assistants/useOutcomeDefinition';
import { useToast } from '@/hooks/use-toast';
import type { OutcomeDefinition } from '@/types/outcomes';
import { EscalationRulesPanel, type EscalationRuleSettings } from './EscalationRulesPanel';
import { PRIMARY_OUTCOMES } from '@/constants/outcomes';

export interface OutcomeConfigTabRef {
  saveEscalationRules: (settings: EscalationRuleSettings) => Promise<void>;
}

interface OutcomeConfigTabProps {
  agentId: string;
  onAgentDataChange?: () => void | Promise<void>;
  onOpenEscalationPanel?: () => void;
  escalationRuleSettings?: EscalationRuleSettings;
  onEscalationRuleSettingsChange?: (settings: EscalationRuleSettings) => void;
  onSaveEscalationRules?: (settings: EscalationRuleSettings) => Promise<void>;
  onEnableTransferToNumber?: (settings: EscalationRuleSettings) => void;
  outcomeCategory?: 'retail' | 'scheduling' | 'recruitment' | 'all'; // Filter outcomes by category
}

const OutcomeConfigTab = forwardRef<OutcomeConfigTabRef, OutcomeConfigTabProps>(({ 
  agentId, 
  onAgentDataChange, 
  onOpenEscalationPanel,
  escalationRuleSettings: externalEscalationRuleSettings,
  onEscalationRuleSettingsChange,
  onSaveEscalationRules,
  onEnableTransferToNumber,
  outcomeCategory = 'all',
}, ref) => {
  const { toast } = useToast();
  const {
    outcomeDefinition,
    loading,
    saving,
    fetchOutcomeDefinition,
    createOutcomeDefinition,
    updateOutcomeDefinition,
  } = useOutcomeDefinition(agentId);

  // Combined state for all primary goals (first one goes to primary_outcome, rest to secondary_outcomes)
  const [primaryOutcomes, setPrimaryOutcomes] = useState<string[]>([]);
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

  // Function to save escalation rules to outcome definition
  const saveEscalationRulesToOutcomeDefinition = useCallback(async (settings: EscalationRuleSettings) => {
    if (primaryOutcomes.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one primary goal before saving escalation rules.',
        variant: 'destructive',
      });
      return;
    }

    // First goal goes to primary_outcome, rest to secondary_outcomes
    const data = {
      primary_outcome: primaryOutcomes[0] || '',
      secondary_outcomes: primaryOutcomes.slice(1),
      success_conditions: {
        keywords: successKeywords.filter(k => k.trim()),
      },
      failure_conditions: {
        failure_keywords: failureKeywords.filter(k => k.trim()),
      },
      escalation_rules: {
        escalation_keywords: settings.escalation_keywords?.filter(k => k.trim()) || [],
        name: settings.name,
        description: settings.description,
        disableInterruptions: settings.disableInterruptions,
        humanTransferRules: settings.humanTransferRules,
      },
    };

    try {
      if (outcomeDefinition) {
        await updateOutcomeDefinition(data);
      } else {
        await createOutcomeDefinition(data);
      }
      
      toast({
        title: 'Success',
        description: 'Escalation rules saved successfully.',
      });
      
      // Refetch outcome definition to update local state
      await fetchOutcomeDefinition();
    } catch (error: unknown) {
      console.error('Error saving escalation rules:', error);
      const errorMessage = (error as { response?: { data?: { errors?: string | string[] } }; message?: string })?.response?.data?.errors || 
                          (error as { message?: string })?.message || 
                          'Failed to save escalation rules';
      toast({
        title: 'Error',
        description: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  }, [
    primaryOutcomes,
    successKeywords,
    failureKeywords,
    outcomeDefinition,
    updateOutcomeDefinition,
    createOutcomeDefinition,
    fetchOutcomeDefinition,
    toast,
  ]);

  // Expose save function to parent via ref
  useImperativeHandle(ref, () => ({
    saveEscalationRules: saveEscalationRulesToOutcomeDefinition,
  }), [saveEscalationRulesToOutcomeDefinition]);

  useEffect(() => {
    if (outcomeDefinition) {
      // Combine primary_outcome and secondary_outcomes into single array
      const newPrimaryOutcome = outcomeDefinition.primary_outcome || '';
      const newSecondaryOutcomes = outcomeDefinition.secondary_outcomes || [];
      const allOutcomes = newPrimaryOutcome ? [newPrimaryOutcome, ...newSecondaryOutcomes] : [];
      
      // Handle keywords - ensure we have at least one empty string if array is empty
      // This is needed because empty arrays [] are truthy, so we need to check length
      const successKws = outcomeDefinition.success_conditions?.keywords;
      const newSuccessKeywords = Array.isArray(successKws) && successKws.length > 0 ? successKws : [''];
      
      const failureKws = outcomeDefinition.failure_conditions?.failure_keywords;
      const newFailureKeywords = Array.isArray(failureKws) && failureKws.length > 0 ? failureKws : [''];
      
      // Load escalation rule settings if they exist
      let newEscalationRuleSettings: EscalationRuleSettings;
      if (outcomeDefinition.escalation_rules) {
        const escalationKws = outcomeDefinition.escalation_rules?.escalation_keywords;
        newEscalationRuleSettings = {
          name: outcomeDefinition.escalation_rules.name || 'transfer_to_number',
          description: outcomeDefinition.escalation_rules.description || '',
          disableInterruptions: outcomeDefinition.escalation_rules.disableInterruptions || false,
          humanTransferRules: outcomeDefinition.escalation_rules.humanTransferRules || [],
          escalation_keywords: Array.isArray(escalationKws) && escalationKws.length > 0 ? escalationKws : [],
        };
      } else {
        // Reset to defaults if no escalation rules
        newEscalationRuleSettings = {
          name: 'transfer_to_number',
          description: '',
          disableInterruptions: false,
          humanTransferRules: [],
          escalation_keywords: [],
        };
      }

      // Update state
      setPrimaryOutcomes(allOutcomes);
      setSuccessKeywords(newSuccessKeywords);
      setFailureKeywords(newFailureKeywords);
      setEscalationRuleSettings(newEscalationRuleSettings);

      // Update the ref to match the loaded data so auto-save doesn't trigger
      // Note: escalation_rules are excluded from auto-save comparison
      previousDataRef.current = JSON.stringify({
        primary_outcomes: allOutcomes,
        success_keywords: newSuccessKeywords,
        failure_keywords: newFailureKeywords,
      });
    } else {
      // Reset to defaults
      setPrimaryOutcomes([]);
      setSuccessKeywords(['']);
      setFailureKeywords(['']);
      
      // Update the ref for empty state (excluding escalation_rules from auto-save)
      previousDataRef.current = JSON.stringify({
        primary_outcomes: [],
        success_keywords: [''],
        failure_keywords: [''],
      });
    }
  }, [outcomeDefinition, setEscalationRuleSettings]);

  // Track if this is the initial load to prevent auto-save on mount
  const isInitialLoad = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');

  // Auto-save when values change (but not on initial load)
  // Note: escalation_rules are excluded from auto-save - they are only saved when the save button is clicked
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      // Store initial data to compare against (excluding escalation_rules for auto-save comparison)
      const initialData = JSON.stringify({
        primary_outcomes: primaryOutcomes,
        success_keywords: successKeywords,
        failure_keywords: failureKeywords,
      });
      previousDataRef.current = initialData;
      return;
    }

    // Don't save if no primary goals are selected
    if (primaryOutcomes.length === 0) {
      return;
    }

    // Create current data snapshot for comparison (excluding escalation_rules)
    const currentData = JSON.stringify({
      primary_outcomes: primaryOutcomes,
      success_keywords: successKeywords,
      failure_keywords: failureKeywords,
    });

    // Only save if data actually changed
    if (currentData === previousDataRef.current) {
      return;
    }

    // Update the ref with current data
    previousDataRef.current = currentData;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save by 500ms
    saveTimeoutRef.current = setTimeout(async () => {
      // First goal goes to primary_outcome, rest to secondary_outcomes
      const data = {
        primary_outcome: primaryOutcomes[0] || '',
        secondary_outcomes: primaryOutcomes.slice(1),
        success_conditions: {
          keywords: successKeywords.filter(k => k.trim()),
        },
        failure_conditions: {
          failure_keywords: failureKeywords.filter(k => k.trim()),
        },
        // Note: escalation_rules are preserved from existing definition during auto-save
        // They are only updated when the save button is clicked in the escalation rules panel
        escalation_rules: outcomeDefinition?.escalation_rules || {
          escalation_keywords: [],
          name: 'transfer_to_number',
          description: '',
          disableInterruptions: false,
          humanTransferRules: [],
        },
      };

      try {
        if (outcomeDefinition) {
          await updateOutcomeDefinition(data);
        } else {
          await createOutcomeDefinition(data);
        }
        
        // Update the ref after successful save to prevent re-saving the same data
        previousDataRef.current = JSON.stringify({
          primary_outcomes: primaryOutcomes,
          success_keywords: successKeywords,
          failure_keywords: failureKeywords,
        });
        
        // Refetch outcome definition to update local state
        await fetchOutcomeDefinition();
      } catch (error: unknown) {
        console.error('Error auto-saving outcome definition:', error);
        const errorMessage = (error as { response?: { data?: { errors?: string | string[] } }; message?: string })?.response?.data?.errors || 
                            (error as { message?: string })?.message || 
                            'Failed to save success criteria';
        toast({
          title: 'Error',
          description: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
          variant: 'destructive',
        });
        // Revert the ref on error so it can retry
        previousDataRef.current = JSON.stringify({
          primary_outcomes: primaryOutcomes,
          success_keywords: successKeywords,
          failure_keywords: failureKeywords,
        });
      }
    }, 500);

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [
    primaryOutcomes,
    successKeywords,
    failureKeywords,
    // escalationRuleSettings is intentionally excluded from dependencies
    outcomeDefinition,
    updateOutcomeDefinition,
    createOutcomeDefinition,
    fetchOutcomeDefinition,
    toast,
  ]);


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

  // Filter outcomes based on category
  const filteredOutcomes = outcomeCategory === 'all' 
    ? PRIMARY_OUTCOMES 
    : PRIMARY_OUTCOMES.filter(o => o.category === outcomeCategory || !o.category);

  // Determine agent type based on selected outcomes (check all selected outcomes)
  const selectedOutcomeTypes = primaryOutcomes
    .map(outcomeValue => filteredOutcomes.find(o => o.value === outcomeValue)?.type)
    .filter(Boolean) as string[];
  const selectedOutcomeType = selectedOutcomeTypes.includes('sales') ? 'sales' 
    : selectedOutcomeTypes.includes('support') ? 'support' 
    : 'general';

  // Toggle outcome selection
  const toggleOutcome = (outcomeValue: string) => {
    setPrimaryOutcomes(prev => {
      if (prev.includes(outcomeValue)) {
        return prev.filter(v => v !== outcomeValue);
      } else {
        return [...prev, outcomeValue];
      }
    });
  };

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
          <h2 className="text-2xl font-bold mb-2">Call Outcomes</h2>
          <p className="text-muted-foreground">
            Define what success means for your agent's calls. We'll automatically analyze conversations to track outcomes. Changes are saved automatically.
          </p>
        </div>
        {saving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </div>
        )}
      </div>

      <Collapsible open={isPrimaryOpen} onOpenChange={setIsPrimaryOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="mb-2">Primary Goals</CardTitle>
                  <CardDescription>
                    What are the main things you want your agent to accomplish in each call? You can select multiple goals.
                  </CardDescription>
                </div>
                <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isPrimaryOpen ? 'transform rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="primary-outcomes">Primary Outcomes</Label>
                <div className="mt-2 space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-3">
                  {filteredOutcomes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No outcomes available for this category.</p>
                  ) : (
                    filteredOutcomes.map(outcome => {
                      const isSelected = primaryOutcomes.includes(outcome.value);
                      return (
                        <div
                          key={outcome.value}
                          className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleOutcome(outcome.value)}
                        >
                          <Checkbox
                            id={`outcome-${outcome.value}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleOutcome(outcome.value)}
                          />
                          <label
                            htmlFor={`outcome-${outcome.value}`}
                            className="flex-1 flex items-center gap-2 cursor-pointer"
                          >
                            <span className="text-sm font-medium">{outcome.label}</span>
                            <Badge variant={outcome.type === 'support' ? 'default' : outcome.type === 'sales' ? 'secondary' : 'outline'} className="text-xs">
                              {outcome.type}
                            </Badge>
                          </label>
                        </div>
                      );
                    })
                  )}
                </div>
                {primaryOutcomes.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-2">Please select at least one primary goal.</p>
                )}
              </div>

              {/* Display selected goals as chips */}
              {primaryOutcomes.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Goals</Label>
                  <div className="flex flex-wrap gap-2">
                    {primaryOutcomes.map(outcomeValue => {
                      const outcome = filteredOutcomes.find(o => o.value === outcomeValue);
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

              {selectedOutcomeType && primaryOutcomes.length > 0 && (
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

      {/* <Collapsible open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="mb-2">Success Indicators</CardTitle>
                  <CardDescription>
                    Optional: Add keywords that help identify successful calls. Our AI will automatically analyze conversations, but you can add specific words to look for.
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
                  <CardTitle className="mb-2">Failure Indicators</CardTitle>
                  <CardDescription>
                    Optional: Add keywords that help identify unsuccessful calls. Our AI will automatically analyze conversations, but you can add specific words to look for.
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
      </Collapsible> */}

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
});

OutcomeConfigTab.displayName = 'OutcomeConfigTab';

export default OutcomeConfigTab;

