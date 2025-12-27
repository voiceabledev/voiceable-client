/**
 * Financial Simulation Runner
 * 
 * Run this component to see financial projections
 */

import React, { useState } from 'react';
import { FinancialSimulator, SCENARIOS, SimulationConfig, MonthlyMetrics } from './financialSimulation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Users, DollarSign, Server, CreditCard } from 'lucide-react';

interface SimulationResults {
  monthly: MonthlyMetrics[];
  summary: {
    totalRevenue: number;
    totalCosts: number;
    totalProfit: number;
    avgGrossMargin: number;
    avgNetMargin: number;
    finalUsers: number;
    finalActiveUsers: number;
    avgMonthlyRevenue: number;
    avgMonthlyProfit: number;
  };
}

interface FinancialSimulationRunnerProps {
  hideHeader?: boolean;
}

export function FinancialSimulationRunner({ hideHeader = false }: FinancialSimulationRunnerProps = {}) {
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof SCENARIOS>('moderate');
  const [months, setMonths] = useState(12);
  const [customConfig, setCustomConfig] = useState<SimulationConfig>(SCENARIOS.moderate);
  const [results, setResults] = useState<SimulationResults | null>(null);

  const runSimulation = () => {
    const config = customConfig;
    const simulator = new FinancialSimulator(config);
    const monthlyResults = simulator.simulateMonths(months);
    const summary = simulator.generateSummary(monthlyResults);
    
    setResults({
      monthly: monthlyResults,
      summary,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className={`space-y-6 ${hideHeader ? '' : 'p-6 max-w-7xl mx-auto'}`}>
      {!hideHeader && (
        <div>
          <h1 className="text-3xl font-bold mb-2">Financial Simulation</h1>
          <p className="text-muted-foreground">
            Project revenue, costs, and profitability based on user growth and usage patterns
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Simulation Configuration</CardTitle>
          <CardDescription>Select a scenario or customize parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Scenario</Label>
              <Select
                value={selectedScenario}
                onValueChange={(value) => {
                  setSelectedScenario(value as keyof typeof SCENARIOS);
                  setCustomConfig(SCENARIOS[value as keyof typeof SCENARIOS]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative (Early Stage)</SelectItem>
                  <SelectItem value="moderate">Moderate (Growing)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (Scaling)</SelectItem>
                  <SelectItem value="enterprise">Enterprise (Large Scale)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Months to Simulate</Label>
              <Input
                type="number"
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value) || 12)}
                min={1}
                max={60}
              />
            </div>
          </div>

          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Total Users (Starting)</Label>
                  <Input
                    type="number"
                    value={customConfig.totalUsers}
                    onChange={(e) => setCustomConfig({ ...customConfig, totalUsers: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Active Users (%)</Label>
                  <Input
                    type="number"
                    value={customConfig.activeUsers}
                    onChange={(e) => setCustomConfig({ ...customConfig, activeUsers: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>New Users Per Month</Label>
                  <Input
                    type="number"
                    value={customConfig.newUsersPerMonth}
                    onChange={(e) => setCustomConfig({ ...customConfig, newUsersPerMonth: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="usage" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Calls Per User Per Month</Label>
                  <Input
                    type="number"
                    value={customConfig.callsPerUserPerMonth}
                    onChange={(e) => setCustomConfig({ ...customConfig, callsPerUserPerMonth: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Avg Call Length (minutes)</Label>
                  <Input
                    type="number"
                    value={customConfig.avgCallLengthMinutes}
                    onChange={(e) => setCustomConfig({ ...customConfig, avgCallLengthMinutes: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="infrastructure" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>API Dynos</Label>
                  <Input
                    type="number"
                    value={customConfig.apiDynos}
                    onChange={(e) => setCustomConfig({ ...customConfig, apiDynos: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Frontend Dynos</Label>
                  <Input
                    type="number"
                    value={customConfig.frontendDynos}
                    onChange={(e) => setCustomConfig({ ...customConfig, frontendDynos: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label>Dyno Type</Label>
                  <Select
                    value={customConfig.herokuDynoType}
                    onValueChange={(value) => setCustomConfig({ ...customConfig, herokuDynoType: value as SimulationConfig['herokuDynoType'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic ($7/mo)</SelectItem>
                      <SelectItem value="standard-1x">Standard-1X ($25/mo)</SelectItem>
                      <SelectItem value="standard-2x">Standard-2X ($50/mo)</SelectItem>
                      <SelectItem value="performance-m">Performance-M ($250/mo)</SelectItem>
                      <SelectItem value="performance-l">Performance-L ($500/mo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Postgres Plan</Label>
                  <Select
                    value={customConfig.postgresPlan}
                    onValueChange={(value) => setCustomConfig({ ...customConfig, postgresPlan: value as SimulationConfig['postgresPlan'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="essential-0">Essential-0 (Free)</SelectItem>
                      <SelectItem value="essential-1">Essential-1 ($9/mo)</SelectItem>
                      <SelectItem value="standard-0">Standard-0 ($50/mo)</SelectItem>
                      <SelectItem value="standard-1">Standard-1 ($200/mo)</SelectItem>
                      <SelectItem value="premium-0">Premium-0 ($600/mo)</SelectItem>
                      <SelectItem value="premium-1">Premium-1 ($2000/mo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hosting Cost/Min</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={customConfig.hostingCostPerMin}
                    onChange={(e) => setCustomConfig({ ...customConfig, hostingCostPerMin: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Provider Cost Margin (%)</Label>
                  <Input
                    type="number"
                    value={customConfig.providerCostMargin}
                    onChange={(e) => setCustomConfig({ ...customConfig, providerCostMargin: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>Avg Payment Amount</Label>
                  <Input
                    type="number"
                    value={customConfig.avgPaymentAmount}
                    onChange={(e) => setCustomConfig({ ...customConfig, avgPaymentAmount: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={runSimulation} className="w-full">
            Run Simulation
          </Button>
        </CardContent>
      </Card>

      {results && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(results.summary.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(results.summary.avgMonthlyRevenue)}/month avg
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
                {results.summary.totalProfit > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${results.summary.totalProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(results.summary.totalProfit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {results.summary.avgNetMargin.toFixed(1)}% net margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Final Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(results.summary.finalUsers)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(results.summary.finalActiveUsers)} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{results.summary.avgGrossMargin.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {results.summary.avgNetMargin.toFixed(1)}% net margin
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown</CardTitle>
              <CardDescription>Revenue, costs, and profit by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Month</th>
                      <th className="text-right p-2">Users</th>
                      <th className="text-right p-2">Minutes</th>
                      <th className="text-right p-2">Revenue</th>
                      <th className="text-right p-2">Costs</th>
                      <th className="text-right p-2">Profit</th>
                      <th className="text-right p-2">Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.monthly.map((month: MonthlyMetrics) => (
                      <tr key={month.month} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{month.month}</td>
                        <td className="text-right p-2">{formatNumber(month.totalUsers)}</td>
                        <td className="text-right p-2">{formatNumber(Math.round(month.totalMinutes))}</td>
                        <td className="text-right p-2">{formatCurrency(month.totalRevenue)}</td>
                        <td className="text-right p-2">{formatCurrency(month.totalCosts)}</td>
                        <td className={`text-right p-2 font-medium ${month.netProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(month.netProfit)}
                        </td>
                        <td className={`text-right p-2 ${month.netMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {month.netMargin.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown (Final Month)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider Costs</span>
                    <span className="font-medium">
                      {formatCurrency(results.monthly[results.monthly.length - 1].providerCosts)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Infrastructure</span>
                    <span className="font-medium">
                      {formatCurrency(results.monthly[results.monthly.length - 1].infrastructureCost)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stripe Fees</span>
                    <span className="font-medium">
                      {formatCurrency(results.monthly[results.monthly.length - 1].stripeFees)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total Costs</span>
                    <span className="font-bold">
                      {formatCurrency(results.monthly[results.monthly.length - 1].totalCosts)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown (Final Month)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hosting Revenue</span>
                    <span className="font-medium">
                      {formatCurrency(results.monthly[results.monthly.length - 1].hostingRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider Revenue</span>
                    <span className="font-medium">
                      {formatCurrency(results.monthly[results.monthly.length - 1].providerRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-semibold">Total Revenue</span>
                    <span className="font-bold">
                      {formatCurrency(results.monthly[results.monthly.length - 1].totalRevenue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

