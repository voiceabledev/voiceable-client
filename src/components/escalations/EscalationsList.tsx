import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, Eye } from 'lucide-react';
import { escalationsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { HumanHandoffEvent } from '@/types/outcomes';
import EscalationDetailModal from './EscalationDetailModal';

interface EscalationsListProps {
  agentId?: string | number;
}

export default function EscalationsList({ agentId }: EscalationsListProps) {
  const { toast } = useToast();
  const [escalations, setEscalations] = useState<HumanHandoffEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEscalation, setSelectedEscalation] = useState<HumanHandoffEvent | null>(null);

  useEffect(() => {
    fetchEscalations();
  }, [agentId, statusFilter]);

  const fetchEscalations = async () => {
    setLoading(true);
    try {
      const response = await escalationsApi.list({
        agent_id: agentId,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (response.data?.data) {
        setEscalations(response.data.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load escalations.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  const filteredEscalations = escalations.filter((esc) => {
    const matchesSearch =
      esc.context_summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      esc.intent?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      esc.trigger_reason?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search escalations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Escalations List */}
        <div className="space-y-2">
          {filteredEscalations.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  <p>No escalations found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredEscalations.map((escalation) => (
              <Card key={escalation.id} className="cursor-pointer hover:bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(escalation.handoff_status)}
                        {escalation.intent && (
                          <Badge variant="outline">{escalation.intent}</Badge>
                        )}
                      </div>
                      {escalation.context_summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {escalation.context_summary}
                        </p>
                      )}
                      {escalation.trigger_reason && (
                        <p className="text-xs text-muted-foreground">
                          Trigger: {escalation.trigger_reason}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(escalation.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEscalation(escalation)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {selectedEscalation && (
        <EscalationDetailModal
          escalation={selectedEscalation}
          onClose={() => setSelectedEscalation(null)}
          onUpdate={fetchEscalations}
        />
      )}
    </>
  );
}

