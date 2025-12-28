import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useSalesDashboard } from '@/hooks/dashboards/useDashboard';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface SalesDashboardProps {
  agentId?: string | number;
  dateRange?: { start_date?: string; end_date?: string };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function SalesDashboard({ agentId, dateRange }: SalesDashboardProps) {
  const { data, loading } = useSalesDashboard({ agent_id: agentId, ...dateRange });

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

  const objectionData = data.objection_breakdown?.map((obj, index) => ({
    name: obj.reason_code,
    value: obj.count,
    color: COLORS[index % COLORS.length],
  })) || [];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meetings Booked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{data.meetings_booked}</div>
              {data.trends?.meetings_trend && (
                <div className="flex items-center gap-1">
                  <TrendIcon direction={data.trends.meetings_trend.direction} />
                  <span className={cn(
                    "text-xs",
                    data.trends.meetings_trend.direction === 'up' ? "text-green-500" :
                    data.trends.meetings_trend.direction === 'down' ? "text-red-500" :
                    "text-muted-foreground"
                  )}>
                    {Math.abs(data.trends.meetings_trend.change_percent).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Qualification Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{data.qualification_rate.toFixed(1)}%</div>
              {data.trends?.qualification_trend && (
                <div className="flex items-center gap-1">
                  <TrendIcon direction={data.trends.qualification_trend.direction} />
                  <span className={cn(
                    "text-xs",
                    data.trends.qualification_trend.direction === 'up' ? "text-green-500" :
                    data.trends.qualification_trend.direction === 'down' ? "text-red-500" :
                    "text-muted-foreground"
                  )}>
                    {Math.abs(data.trends.qualification_trend.change_percent).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cost Per Meeting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.cost_per_meeting.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.pipeline_influenced?.potentialValue?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Trends</CardTitle>
            <CardDescription>Daily booking and qualification trends</CardDescription>
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
                  <Line type="monotone" dataKey="meetings_booked" stroke="#22c55e" name="Meetings Booked" />
                  <Line type="monotone" dataKey="qualified" stroke="#3b82f6" name="Qualified" />
                  <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-muted-foreground py-8">No trend data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objection Breakdown</CardTitle>
            <CardDescription>Top reasons for failed conversations</CardDescription>
          </CardHeader>
          <CardContent>
            {objectionData.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={objectionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {objectionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {data.objection_breakdown?.map((obj, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                      <div>
                        <Badge variant="outline">{obj.reason_code}</Badge>
                        {obj.description && (
                          <p className="text-xs text-muted-foreground mt-1">{obj.description}</p>
                        )}
                      </div>
                      <div className="text-sm font-semibold">{obj.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">No objection data available</div>
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
              <p className="text-sm text-muted-foreground">Meetings Booked</p>
              <p className="text-2xl font-bold text-green-500">{data.meetings_booked}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Leads Qualified</p>
              <p className="text-2xl font-bold text-blue-500">
                {data.successful_conversations - data.meetings_booked}
              </p>
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

