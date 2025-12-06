import { Header } from "@/components/layout/Header";
import { Phone, Clock, CreditCard, TrendingDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const metrics = [
  {
    label: "Number of Calls",
    value: "0",
    change: "0.0%",
    icon: Phone,
  },
  {
    label: "Avg Duration",
    value: "0:00",
    change: "0.0%",
    icon: Clock,
  },
  {
    label: "Total Cost",
    value: "0",
    unit: "credits",
    change: "0.0%",
    icon: CreditCard,
  },
  {
    label: "Avg Cost",
    value: "0",
    unit: "cr/call",
    change: "0.0%",
    icon: TrendingDown,
  },
];

export default function Overview() {
  return (
    <div className="min-h-screen">
      <Header showDocs />
      
      <div className="p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <p className="text-muted-foreground text-sm">email@example.com's Org</p>
          <h1 className="text-4xl font-bold mt-1">Welcome Vbrazo</h1>
        </div>

        {/* Metrics Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Metrics</h2>
          <div className="flex items-center gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-40 bg-transparent border-border">
                <SelectValue placeholder="All Assistants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assistants</SelectItem>
                <SelectItem value="riley">Riley</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="month">
              <SelectTrigger className="w-36 bg-transparent border-border">
                <SelectValue placeholder="Last Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => (
            <div key={metric.label} className="metric-card animate-fade-in">
              <p className="text-muted-foreground text-sm mb-3">{metric.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{metric.value}</span>
                {metric.unit && (
                  <span className="text-muted-foreground text-sm">{metric.unit}</span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-2 text-muted-foreground text-sm">
                <span>—</span>
                <span>{metric.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Call Success Section */}
        <div className="bg-card border border-border rounded-lg p-6 min-h-[400px]">
          <h3 className="text-lg font-semibold mb-4">Call Success</h3>
          <p className="text-muted-foreground text-xl">--</p>
          
          {/* Empty State */}
          <div className="flex flex-col items-center justify-center h-72">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Phone className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">Oops...</p>
            <p className="text-muted-foreground text-sm">You don't have any calls yet</p>
          </div>
        </div>
      </div>

      {/* Ask AI Button */}
      <button className="fixed bottom-6 right-6 flex items-center gap-2 bg-card border border-border rounded-full px-4 py-3 shadow-lg hover:bg-secondary transition-colors">
        <span className="text-sm font-medium">Ask AI</span>
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">V</span>
        </div>
      </button>
    </div>
  );
}
