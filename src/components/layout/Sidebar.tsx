import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Phone,
  AudioLines,
  Key,
  FileText,
  MessageSquare,
  Search,
  ArrowUp,
  PhoneOutgoing,
  Settings,
  LogOut,
} from "lucide-react";
import { PurchaseCreditsModal } from "@/components/PurchaseCreditsModal";

const buildItems = [
  { icon: Users, label: "Assistants", path: "/assistants" },
  { icon: Phone, label: "Phone Numbers", path: "/phone-numbers" },
  { icon: FileText, label: "Knowledge Base", path: "/files" },
  { icon: AudioLines, label: "Voice Library", path: "/voice-library" },
  { icon: Key, label: "API Keys", path: "/api-keys" },
];

const evaluateItems = [
  { icon: MessageSquare, label: "Conversations", path: "/conversations" },
];
const outboundItems = [
  { icon: PhoneOutgoing, label: "Outbound", path: "/outbound" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentBalance] = useState(10);

  const handleSignOut = () => {
    // Handle sign out logic here (clear tokens, session, etc.)
    // For now, just navigate to login
    navigate("/login");
  };
  const renderNavItem = (item: { icon: any; label: string; path: string; badge?: string }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={cn(
          "sidebar-item",
          isActive && "sidebar-item-active"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
        {item.badge && (
          <span className="ml-auto text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded font-medium">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="w-60 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-white font-bold text-sm">VA</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">Voice AI</span>
        </div>
      </div>

      {/* Org Selector */}
      <div className="px-3 py-3 border-b border-sidebar-border">
        <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-sidebar-accent text-sm">
          <span className="w-5 h-5 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
            V
          </span>
          <span className="text-sidebar-accent-foreground truncate">email@example.com's Org</span>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Overview */}
        <NavLink
          to="/overview"
          className={cn(
            "sidebar-item",
            location.pathname === "/" && "sidebar-item-active"
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Overview</span>
        </NavLink>

        {/* Build Section */}
        <div>
          <p className="section-label">Build</p>
          <div className="space-y-0.5">
            {buildItems.map(renderNavItem)}
          </div>
        </div>

        {/* Evaluate Section */}
        <div>
          <p className="section-label">Evaluate</p>
          <div className="space-y-0.5">
            {evaluateItems.map(renderNavItem)}
          </div>
        </div>

        {/* Outbound Section */}
        <div>
          <p className="section-label">Outbound</p>
          <div className="space-y-0.5">
            {outboundItems.map(renderNavItem)}
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <p className="section-label">Settings</p>
          <div className="space-y-0.5">
            {renderNavItem({ icon: Settings, label: "Settings", path: "/settings" })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs bg-secondary px-2 py-1 rounded font-medium text-muted-foreground">PAYG</span>
          <span className="text-sm text-foreground">
            <span className="font-medium">{currentBalance.toFixed(2)}</span>
            <span className="text-muted-foreground"> Credits</span>
          </span>
        </div>
        <button 
          onClick={() => navigate("/settings/billing?openModal=true")}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors"
        >
          <ArrowUp className="h-4 w-4" />
          <span>Buy Credits</span>
        </button>
        <button 
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-sm font-medium transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>

    </aside>
  );
}
