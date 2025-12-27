import { Outlet, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Users,
  Users2,
  Plug,
  PhoneOutgoing,
  Phone,
  Key,
  ArrowLeft,
  CreditCard,
  TrendingDown,
  Calculator,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Users2, label: "Agents", path: "/admin/agents" },
  { icon: Plug, label: "Integrations", path: "/admin/integrations" },
  { icon: PhoneOutgoing, label: "Campaigns", path: "/admin/campaigns" },
  { icon: Phone, label: "Phone Numbers", path: "/admin/phone-numbers" },
  { icon: Key, label: "API Keys", path: "/admin/api-keys" },
  { icon: CreditCard, label: "Payments", path: "/admin/payments" },
  { icon: TrendingDown, label: "Conversation Spending", path: "/admin/conversation-spending" },
  { icon: Calculator, label: "Financial Simulation", path: "/admin/financial-simulation" },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/overview")}
            className="flex-shrink-0 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 flex items-center gap-2">
              <Shield className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              Admin Panel
            </h2>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage all system resources
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-border bg-card/50 flex-shrink-0 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
