import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';
import { escalationsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { HumanHandoffEvent } from '@/types/outcomes';

interface EscalationDetailModalProps {
  escalation: HumanHandoffEvent;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EscalationDetailModal({
  escalation,
  onClose,
  onUpdate,
}: EscalationDetailModalProps) {
  const { toast } = useToast();
  const [handoffStatus, setHandoffStatus] = useState(escalation.handoff_status);
  const [handledBy, setHandledBy] = useState(escalation.handled_by || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await escalationsApi.update(escalation.id, {
        handoff_status: handoffStatus as any,
        handled_by: handledBy || null,
      });
      toast({
        title: 'Success',
        description: 'Escalation updated successfully.',
      });
      onUpdate();
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update escalation.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Pending', className: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
      in_progress: { label: 'In Progress', className: 'bg-blue-500 hover:bg-blue-600 text-white' },
      completed: { label: 'Completed', className: 'bg-green-500 hover:bg-green-600 text-white' },
      cancelled: { label: 'Cancelled', className: 'bg-gray-500 hover:bg-gray-600 text-white' },
    };
    const { label, className } = config[status as keyof typeof config] || { label: status, className: '' };
    return <Badge className={className}>{label}</Badge>;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escalation Details</DialogTitle>
          <DialogDescription>
            View and manage human handoff event
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Info */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <div className="mt-1">{getStatusBadge(escalation.handoff_status)}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Created</Label>
              <p className="text-sm mt-1">
                {new Date(escalation.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <Separator />

          {/* Context Summary */}
          {escalation.context_summary && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Context Summary</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{escalation.context_summary}</p>
              </div>
            </div>
          )}

          {/* Intent */}
          {escalation.intent && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Detected Intent</Label>
              <Badge variant="outline">{escalation.intent}</Badge>
            </div>
          )}

          {/* Transcript Excerpt */}
          {escalation.transcript_excerpt && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Transcript Excerpt</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{escalation.transcript_excerpt}</p>
              </div>
            </div>
          )}

          {/* Trigger Reason */}
          {escalation.trigger_reason && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Trigger Reason</Label>
              <p className="text-sm">{escalation.trigger_reason}</p>
            </div>
          )}

          <Separator />

          {/* Update Status */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Update Status</Label>
              <Select value={handoffStatus} onValueChange={setHandoffStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="handled-by">Handled By</Label>
              <Textarea
                id="handled-by"
                value={handledBy}
                onChange={(e) => setHandledBy(e.target.value)}
                placeholder="Enter handler name or identifier"
                rows={2}
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

