import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Settings as SettingsIcon,
  Building2,
  CreditCard,
  Users,
  Link2,
  AudioLines,
  User
} from "lucide-react";

const orgSettings = [
  { icon: Building2, label: "Org Settings", path: "/settings/org" },
  { icon: CreditCard, label: "Billing & Add-Ons", path: "/settings/billing" },
  { icon: Users, label: "Members", path: "/settings/members" },
  { icon: Link2, label: "Integrations", path: "/settings/integrations" },
];

const communitySettings = [
  { icon: AudioLines, label: "Voice Library", path: "/settings/voice-library" },
];

const accountSettings = [
  { icon: User, label: "Profile", path: "/settings/profile" },
];

export default function Settings() {
  const location = useLocation();

  const renderNavItem = (item: { icon: any; label: string; path: string }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          isActive 
            ? "bg-secondary text-foreground" 
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Settings Sidebar */}
      <div className="w-64 border-r border-border p-4">
        <div className="flex items-center gap-2 mb-6">
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>

        <nav className="space-y-6">
          <div>
            <p className="section-label mb-2">Org Settings</p>
            <div className="space-y-1">
              {orgSettings.map(renderNavItem)}
            </div>
          </div>

          <div>
            <p className="section-label mb-2">Community</p>
            <div className="space-y-1">
              {communitySettings.map(renderNavItem)}
            </div>
          </div>

          <div>
            <p className="section-label mb-2">Account Settings</p>
            <div className="space-y-1">
              {accountSettings.map(renderNavItem)}
            </div>
          </div>
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
