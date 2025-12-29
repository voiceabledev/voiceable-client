import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, AlertCircle } from 'lucide-react';
import { OutcomeBadge } from '@/components/ui/outcome-badge';
import { ConfidenceIndicator } from '@/components/ui/confidence-indicator';
import { SentimentIndicator } from '@/components/ui/sentiment-indicator';
import { conversationOutcomesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { ConversationOutcome } from '@/types/outcomes';

interface ConversationOutcomePanelProps {
  conversationId: string;
}

export default function ConversationOutcomePanel({ conversationId }: ConversationOutcomePanelProps) {
  const { toast } = useToast();
  const [outcome, setOutcome] = useState<ConversationOutcome | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expectedOutcome, setExpectedOutcome] = useState<string>('');
  const [actualOutcome, setActualOutcome] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    fetchOutcome();
  }, [conversationId]);

  useEffect(() => {
    if (outcome) {
      setExpectedOutcome(outcome.expected_outcome || '');
      setActualOutcome(outcome.actual_outcome || '');
      setNotes(outcome.notes || '');
    }
  }, [outcome]);

  const fetchOutcome = async () => {
    setLoading(true);
    try {
      const response = await conversationOutcomesApi.get(conversationId);
      if (response.data?.data) {
        console.log(response.data);
        setOutcome(response.data.data);
      } else {
        setOutcome(null);
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        toast({
          title: 'Error',
          description: 'Failed to load conversation outcome.',
          variant: 'destructive',
        });
      }
      setOutcome(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!outcome) return;

    setSaving(true);
    try {
      const response = await conversationOutcomesApi.update(conversationId, {
        expected_outcome: expectedOutcome || null,
        actual_outcome: actualOutcome || null,
        notes: notes || null,
      });
      if (response.data?.data) {
        setOutcome(response.data.data);
        toast({
          title: 'Success',
          description: 'Outcome annotation saved successfully.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to save outcome annotation.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!outcome) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No outcome data available for this conversation.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Conversation Result</CardTitle>
            <OutcomeBadge outcome={outcome.outcome as 'success' | 'failure' | 'escalated'} />
          </div>
          <CardDescription>
            Automatically classified on {new Date(outcome.classified_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Reason Code</Label>
              <p className="text-sm font-medium">{outcome.reason_code || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Confidence</Label>
              <ConfidenceIndicator score={outcome.confidence_score} showLabel={false} />
            </div>
            {outcome.sentiment && (
              <div>
                <Label className="text-xs text-muted-foreground">Sentiment</Label>
                <div className="mt-1">
                  <SentimentIndicator sentiment={outcome.sentiment} />
                </div>
              </div>
            )}
            {outcome.duration_seconds && (
              <div>
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <p className="text-sm font-medium">
                  {Math.floor(outcome.duration_seconds / 60)}:{(outcome.duration_seconds % 60).toFixed(0).padStart(2, '0')}
                </p>
              </div>
            )}
          </div>

          {outcome.failure_reasons && outcome.failure_reasons.length > 0 && (
            <>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Failure Reasons</Label>
                <div className="space-y-2">
                  {outcome.failure_reasons.map((reason) => (
                    <div key={reason.id} className="p-2 bg-muted rounded-md">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{reason.reason_code}</Badge>
                        <Badge variant="secondary">{reason.reason_category}</Badge>
                      </div>
                      {reason.description && (
                        <p className="text-xs text-muted-foreground mt-1">{reason.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {outcome.human_handoff_event && (
            <>
              <Separator />
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Human Handoff</Label>
                <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{outcome.human_handoff_event.handoff_status}</Badge>
                    {outcome.human_handoff_event.handled_by && (
                      <span className="text-xs text-muted-foreground">
                        Handled by: {outcome.human_handoff_event.handled_by}
                      </span>
                    )}
                  </div>
                  {outcome.human_handoff_event.context_summary && (
                    <p className="text-xs text-muted-foreground">
                      {outcome.human_handoff_event.context_summary}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Review</CardTitle>
          <CardDescription>
            Annotate this conversation for improvement tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expected-outcome">Expected Outcome</Label>
              <Select value={expectedOutcome} onValueChange={setExpectedOutcome}>
                <SelectTrigger id="expected-outcome">
                  <SelectValue placeholder="Select expected outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="actual-outcome">Actual Outcome</Label>
              <Select value={actualOutcome} onValueChange={setActualOutcome}>
                <SelectTrigger id="actual-outcome">
                  <SelectValue placeholder="Select actual outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this conversation..."
              rows={4}
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Annotation
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

