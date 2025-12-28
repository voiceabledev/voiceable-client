import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useSupportDashboard } from '@/hooks/dashboards/useDashboard';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SupportDashboardProps {
  agentId?: string | number;
  dateRange?: { start_date?: string; end_date?: string };
}

export default function SupportDashboard({ agentId, dateRange }: SupportDashboardProps) {
  const { data, loading } = useSupportDashboard({ agent_id: agentId, ...dateRange });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>No data available</p>
      </div>
    );
  }

  const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'stable' }) => {
    if (direction === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (direction === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{data.resolution_rate.toFixed(1)}%</div>
              {data.trends?.resolution_rate_trend && (
                <div className="flex items-center gap-1">
                  <TrendIcon direction={data.trends.resolution_rate_trend.direction} />
                  <span className={cn(
                    "text-xs",
                    data.trends.resolution_rate_trend.direction === 'up' ? "text-green-500" :
                    data.trends.resolution_rate_trend.direction === 'down' ? "text-red-500" :
                    "text-muted-foreground"
                  )}>
                    {Math.abs(data.trends.resolution_rate_trend.change_percent).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Escalation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{data.escalation_rate.toFixed(1)}%</div>
              {data.trends?.escalation_rate_trend && (
                <div className="flex items-center gap-1">
                  <TrendIcon direction={data.trends.escalation_rate_trend.direction} />
                  <span className={cn(
                    "text-xs",
                    data.trends.escalation_rate_trend.direction === 'up' ? "text-red-500" :
                    data.trends.escalation_rate_trend.direction === 'down' ? "text-green-500" :
                    "text-muted-foreground"
                  )}>
                    {Math.abs(data.trends.escalation_rate_trend.change_percent).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Handle Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avg_handle_time}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cost Avoided</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.cost_avoided.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversation Trends</CardTitle>
            <CardDescription>Daily conversation breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {data.trends?.daily && data.trends.daily.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.trends.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" />
                  <Line type="monotone" dataKey="successful" stroke="#22c55e" name="Successful" />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" />
                  <Line type="monotone" dataKey="escalated" stroke="#f97316" name="Escalated" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-8">No trend data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Unresolved Topics</CardTitle>
            <CardDescription>Most common failure reasons</CardDescription>
          </CardHeader>
          <CardContent>
            {data.top_unresolved_topics && data.top_unresolved_topics.length > 0 ? (
              <div className="space-y-2">
                {data.top_unresolved_topics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div>
                      <Badge variant="outline">{topic.reason_code}</Badge>
                      {topic.description && (
                        <p className="text-xs text-muted-foreground mt-1">{topic.description}</p>
                      )}
                    </div>
                    <div className="text-sm font-semibold">{topic.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">No unresolved topics</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Conversations</p>
              <p className="text-2xl font-bold">{data.total_conversations}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved by AI</p>
              <p className="text-2xl font-bold text-green-500">{data.successful_conversations}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Escalated</p>
              <p className="text-2xl font-bold text-orange-500">{data.escalated_conversations}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-500">{data.failed_conversations}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

