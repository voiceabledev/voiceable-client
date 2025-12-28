import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import SupportDashboard from '@/components/dashboards/SupportDashboard';
import SalesDashboard from '@/components/dashboards/SalesDashboard';
import { useFailureBreakdown } from '@/hooks/dashboards/useDashboard';
import { agentsApi } from '@/lib/api';
import { useEffect } from 'react';
import type { Agent } from '@/lib/api';

export default function Dashboards() {
  const [activeTab, setActiveTab] = useState<'support' | 'sales' | 'failures'>('support');
  const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    agentsApi.list().then((response) => {
      if (response.data) {
        setAgents(response.data);
      }
    });
  }, []);

  const dateRange = {
    start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
  };

  const { data: failureData } = useFailureBreakdown({
    agent_id: selectedAgentId,
    ...dateRange,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Performance Dashboards</h1>
        <p className="text-muted-foreground">
          Track business metrics and conversation outcomes
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="agent">Agent</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger id="agent">
                  <SelectValue placeholder="All agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All agents</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name || agent.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'support' | 'sales' | 'failures')}>
        <TabsList>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="failures">Failure Analysis</TabsTrigger>
        </TabsList>
        <TabsContent value="support" className="mt-6">
          <SupportDashboard agentId={selectedAgentId} dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="sales" className="mt-6">
          <SalesDashboard agentId={selectedAgentId} dateRange={dateRange} />
        </TabsContent>
        <TabsContent value="failures" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Failure Breakdown</CardTitle>
              <CardDescription>Root causes of failed conversations</CardDescription>
            </CardHeader>
            <CardContent>
              {failureData && failureData.length > 0 ? (
                <div className="space-y-2">
                  {failureData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div>
                        <div className="font-medium">{item.reason_code}</div>
                        <div className="text-sm text-muted-foreground">{item.reason_category}</div>
                      </div>
                      <div className="text-lg font-semibold">{item.count}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No failure data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

