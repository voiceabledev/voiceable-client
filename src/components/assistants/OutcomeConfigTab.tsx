import { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useMemo } from 'react';
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
import { Loader2, Plus, X, ChevronDown, Settings, RotateCcw, Check, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useOutcomeDefinition } from '@/hooks/assistants/useOutcomeDefinition';
import { useToast } from '@/hooks/use-toast';
import type { OutcomeDefinition } from '@/types/outcomes';
import { EscalationRulesPanel, type EscalationRuleSettings } from './EscalationRulesPanel';
import { PRIMARY_OUTCOMES } from '@/constants/outcomes';

export interface OutcomeConfigTabRef {
  saveEscalationRules: (settings: EscalationRuleSettings) => Promise<void>;
  getOutcomeState: () => {
    primaryOutcomes: string[];
    successKeywords: string[];
    failureKeywords: string[];
    escalationRuleSettings: EscalationRuleSettings;
  } | null;
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
  onOutcomeStateChange?: () => void; // Callback to notify parent when outcome state changes
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
  onOutcomeStateChange,
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
  const savingEscalationRulesRef = useRef(false);
  const saveEscalationRulesToOutcomeDefinition = useCallback(async (settings: EscalationRuleSettings) => {
    // Prevent duplicate saves
    if (savingEscalationRulesRef.current) {
      return;
    }

    if (primaryOutcomes.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one primary goal before saving escalation rules.',
        variant: 'destructive',
      });
      return;
    }

    savingEscalationRulesRef.current = true;

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
        // Use silent option to prevent duplicate toast from updateOutcomeDefinition
        await updateOutcomeDefinition(data, { silent: true });
      } else {
        // Use silent option to prevent duplicate toast from createOutcomeDefinition
        await createOutcomeDefinition(data, { silent: true });
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
    } finally {
      savingEscalationRulesRef.current = false;
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

  // Expose save function and state getter to parent via ref
  useImperativeHandle(ref, () => ({
    saveEscalationRules: saveEscalationRulesToOutcomeDefinition,
    getOutcomeState: () => {
      return {
        primaryOutcomes,
        successKeywords,
        failureKeywords,
        escalationRuleSettings,
      };
    },
  }), [saveEscalationRulesToOutcomeDefinition, primaryOutcomes, successKeywords, failureKeywords, escalationRuleSettings]);

  useEffect(() => {
    // Set loading flag to prevent auto-save during data load
    isLoadingData.current = true;
    
    if (outcomeDefinition) {
      // Combine primary_outcome and secondary_outcomes into single array
      const newPrimaryOutcome = outcomeDefinition.primary_outcome || '';
      const newSecondaryOutcomes = outcomeDefinition.secondary_outcomes || [];
      const allOutcomes = newPrimaryOutcome ? [newPrimaryOutcome, ...newSecondaryOutcomes] : [];
      
      // Filter out any outcomes that are marked as "coming soon" (disabled)
      const filteredAllOutcomes = allOutcomes.filter(outcomeValue => {
        const outcome = PRIMARY_OUTCOMES.find(o => o.value === outcomeValue);
        return outcome && !outcome.comingSoon;
      });
      
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

      // Update state (using filtered outcomes to remove any coming soon items)
      setPrimaryOutcomes(filteredAllOutcomes);
      setSuccessKeywords(newSuccessKeywords);
      setFailureKeywords(newFailureKeywords);
      setEscalationRuleSettings(newEscalationRuleSettings);
      
      // Don't notify parent here - let the other useEffect handle it after state updates

      // Update the ref to match the loaded data so auto-save doesn't trigger
      // Note: escalation_rules are excluded from auto-save comparison
      // Sort arrays to ensure consistent comparison
      const sortedAllOutcomes = [...filteredAllOutcomes].sort();
      const sortedSuccessKeywords = [...newSuccessKeywords].sort();
      const sortedFailureKeywords = [...newFailureKeywords].sort();
      
      previousDataRef.current = JSON.stringify({
        primary_outcomes: sortedAllOutcomes,
        success_keywords: sortedSuccessKeywords,
        failure_keywords: sortedFailureKeywords,
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
    
    // Use setTimeout to clear loading flag after state updates have been processed
    // This ensures auto-save doesn't trigger from the state updates above
    setTimeout(() => {
      isLoadingData.current = false;
      // Don't notify parent here - let the other useEffect handle it after state updates
    }, 100);
  }, [outcomeDefinition, setEscalationRuleSettings]);

  // Notify parent when outcome state changes (for change tracking)
  // Use a ref to store the callback to avoid infinite loops
  const onOutcomeStateChangeRef = useRef(onOutcomeStateChange);
  useEffect(() => {
    onOutcomeStateChangeRef.current = onOutcomeStateChange;
  }, [onOutcomeStateChange]);

  useEffect(() => {
    if (onOutcomeStateChangeRef.current && !isLoadingData.current) {
      onOutcomeStateChangeRef.current();
    }
  }, [primaryOutcomes, successKeywords, failureKeywords, escalationRuleSettings]);

  // Track if this is the initial load to prevent auto-save on mount
  const isInitialLoad = useRef(true);
  const isLoadingData = useRef(false); // Track when we're loading data from server
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');

  // Auto-save when values change (but not on initial load or when loading data from server)
  // Note: escalation_rules are excluded from auto-save - they are only saved when the save button is clicked
  useEffect(() => {
    // Don't auto-save if we're still on initial load or loading data from server
    if (isInitialLoad.current || isLoadingData.current) {
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
      }
      // Store initial data to compare against (excluding escalation_rules for auto-save comparison)
      // Sort arrays to ensure consistent comparison
      const sortedPrimaryOutcomes = [...primaryOutcomes].sort();
      const sortedSuccessKeywords = [...successKeywords].sort();
      const sortedFailureKeywords = [...failureKeywords].sort();
      
      const initialData = JSON.stringify({
        primary_outcomes: sortedPrimaryOutcomes,
        success_keywords: sortedSuccessKeywords,
        failure_keywords: sortedFailureKeywords,
      });
      previousDataRef.current = initialData;
      return;
    }

    // Create current data snapshot for comparison (excluding escalation_rules)
    // Sort arrays to ensure consistent comparison
    const sortedPrimaryOutcomes = [...primaryOutcomes].sort();
    const sortedSuccessKeywords = [...successKeywords].sort();
    const sortedFailureKeywords = [...failureKeywords].sort();
    
    const currentData = JSON.stringify({
      primary_outcomes: sortedPrimaryOutcomes,
      success_keywords: sortedSuccessKeywords,
      failure_keywords: sortedFailureKeywords,
    });

    // Only save if data actually changed
    if (currentData === previousDataRef.current) {
      return;
    }

    // Don't update previousDataRef until AFTER successful save
    // This allows retry if save fails

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save by 500ms
    saveTimeoutRef.current = setTimeout(async () => {
      // If no goals selected, we still need to save to clear them (backend validation will handle the error)
      // But if there's no existing outcome definition, don't create one with empty goals
      if (primaryOutcomes.length === 0) {
        if (!outcomeDefinition) {
          // Don't create a new outcome definition with no goals
          previousDataRef.current = currentData;
          return;
        }
        // If we have an existing definition, we can try to save empty (backend will validate)
        // But actually, let's prevent this - require at least one goal
        toast({
          title: 'Validation Error',
          description: 'At least one primary goal must be selected.',
          variant: 'destructive',
        });
        // Revert the ref so it can be saved again when user adds a goal
        previousDataRef.current = JSON.stringify({
          primary_outcomes: [],
          success_keywords: sortedSuccessKeywords,
          failure_keywords: sortedFailureKeywords,
        });
        return;
      }
      
      // Ensure first goal is valid
      if (!primaryOutcomes[0]) {
        console.warn('Cannot save: first primary goal is invalid');
        return;
      }
      
      // First goal goes to primary_outcome, rest to secondary_outcomes
      const data = {
        primary_outcome: primaryOutcomes[0],
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
        // Set loading flag before save to prevent any state updates from triggering another save
        isLoadingData.current = true;
        
        if (outcomeDefinition) {
          await updateOutcomeDefinition(data, { silent: true }); // Silent for auto-save
        } else {
          await createOutcomeDefinition(data, { silent: true }); // Silent for auto-save
        }
        
        // Update previousDataRef AFTER successful save
        previousDataRef.current = currentData;
        
        // The hook already updates outcomeDefinition state, which will trigger the load useEffect
        // We set isLoadingData to prevent that from triggering another save
        // No need to refetch - the hook already updated the state
        
        // Clear loading flag after a short delay to allow state to update
        setTimeout(() => {
          isLoadingData.current = false;
        }, 200);
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
        // Clear loading flag on error
        isLoadingData.current = false;
        
        // Don't update previousDataRef on error - this allows the save to retry
        // The current state will be compared against the old previousDataRef
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

  // Filter outcomes based on category and sort alphabetically by label
  const filteredOutcomes = useMemo(() => {
    const filtered = outcomeCategory === 'all' 
      ? PRIMARY_OUTCOMES 
      : PRIMARY_OUTCOMES.filter(o => o.category === outcomeCategory || !o.category);
    
    // Sort alphabetically by label
    return filtered.slice().sort((a, b) => a.label.localeCompare(b.label));
  }, [outcomeCategory]);

  // Order selected primary outcomes based on their order in filteredOutcomes
  const orderedPrimaryOutcomes = useMemo(() => {
    return primaryOutcomes.slice().sort((a, b) => {
      const indexA = filteredOutcomes.findIndex(o => o.value === a);
      const indexB = filteredOutcomes.findIndex(o => o.value === b);
      // If not found in filteredOutcomes, put at the end
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [primaryOutcomes, filteredOutcomes]);

  // Determine agent type based on selected outcomes (check all selected outcomes)
  const selectedOutcomeTypes = primaryOutcomes
    .map(outcomeValue => filteredOutcomes.find(o => o.value === outcomeValue)?.type)
    .filter(Boolean) as string[];
  const selectedOutcomeType = selectedOutcomeTypes.includes('sales') ? 'sales' 
    : selectedOutcomeTypes.includes('support') ? 'support' 
    : 'general';

  // Toggle outcome selection
  const toggleOutcome = useCallback((outcomeValue: string) => {
    // Check if outcome is disabled (coming soon)
    const outcome = filteredOutcomes.find(o => o.value === outcomeValue);
    if (outcome?.comingSoon) {
      return; // Don't allow selection of coming soon outcomes
    }
    
    setPrimaryOutcomes(prev => {
      if (prev.includes(outcomeValue)) {
        // Unselecting - check if this is the last item
        if (prev.length === 1) {
          toast({
            title: 'Cannot unselect',
            description: 'At least one primary goal must be selected.',
            variant: 'destructive',
          });
          return prev; // Don't allow unselecting the last item
        }
        return prev.filter(v => v !== outcomeValue);
      } else {
        // Selecting - add to array
        return [...prev, outcomeValue];
      }
    });
  }, [toast, filteredOutcomes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
          <Target className="h-4 w-4" />
          <span>CALL OUTCOMES</span>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 md:p-6">
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="text-left flex-1">
              <h3 className="text-base md:text-lg font-semibold">Call Outcomes</h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                Define what success means for your agent's calls. We'll automatically analyze conversations to track outcomes. Changes are saved automatically.
              </p>
            </div>
            {saving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Primary Goals Section */}
            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <button 
                className="w-full flex items-start justify-between gap-2" 
                onClick={() => setIsPrimaryOpen(!isPrimaryOpen)}
              >
                <div className="text-left flex-1">
                  <h3 className="text-base md:text-lg font-semibold">Primary Goals</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    What are the main things you want your agent to accomplish in each call? You can select multiple goals.
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-transform flex-shrink-0 mt-1",
                    isPrimaryOpen && "rotate-180"
                  )}
                />
              </button>

              {isPrimaryOpen && (
                <div className="mt-4 md:mt-6 space-y-4">
              <div>
                {/* <Label htmlFor="primary-outcomes">Primary Outcomes</Label> */}
                <div className="mt-2 space-y-2 max-h-[300px] overflow-y-auto border rounded-md p-3">
                  {filteredOutcomes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No outcomes available for this category.</p>
                  ) : (
                    filteredOutcomes.map(outcome => {
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
                              id={`outcome-${outcome.value}`}
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
                            htmlFor={`outcome-${outcome.value}`}
                            className={`flex-1 flex items-center gap-2 ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                          >
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
                    {orderedPrimaryOutcomes.map(outcomeValue => {
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
                </div>
              )}
            </div>

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

            {/* Escalation Rules Section */}
            <div className="bg-card border border-border rounded-lg p-4 md:p-6">
              <div className="flex items-start justify-between gap-2">
                <div className="text-left flex-1">
                  <h3 className="text-base md:text-lg font-semibold">Escalation Rules</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Configure transfer behaviors and escalation triggers
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (onOpenEscalationPanel) {
                      onOpenEscalationPanel();
                    }
                  }}
                  className="h-8 flex-shrink-0"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Escalation Rules Panel - will be rendered in parent's right panel area */}
    </div>
  );
});

OutcomeConfigTab.displayName = 'OutcomeConfigTab';

export default OutcomeConfigTab;

