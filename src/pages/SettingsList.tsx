import { useNavigate } from "react-router-dom";
import { 
  Settings as SettingsIcon,
  Building2,
  CreditCard,
  Users,
  Link2,
  AudioLines,
  User,
  TrendingUp,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";

const orgSettings = [
  // { icon: Building2, label: "Org Settings", path: "/settings/org", description: "Manage your organization details and preferences" },
  { icon: CreditCard, label: "Billing & Add-Ons", path: "/settings/billing", description: "Manage your subscription, payment methods, and add-ons" },
  // { icon: TrendingUp, label: "Financial Simulation", path: "/settings/financial-simulation", description: "Project revenue, costs, and profitability based on user growth" },
  // { icon: Users, label: "Members", path: "/settings/members", description: "Invite and manage team members" },
  // { icon: Link2, label: "Integrations", path: "/settings/integrations", description: "Connect and configure third-party services" },
];

const developerSettings = [
  { icon: Key, label: "API Keys", path: "/settings/api-keys", description: "Manage your API keys and authentication" },
];

const communitySettings = [
  { icon: AudioLines, label: "Voice Library", path: "/settings/voice-library", description: "Browse and manage your voice library" },
];

const accountSettings = [
  { icon: User, label: "Profile", path: "/settings/profile", description: "Manage your account settings and preferences" },
];

export default function SettingsList() {
  const navigate = useNavigate();

  const handleSettingClick = (path: string) => {
    navigate(path);
  };

  const renderSettingCard = (item: { icon: any; label: string; path: string; description: string }) => {
    const Icon = item.icon;
    return (
      <div
        key={item.path}
        onClick={() => handleSettingClick(item.path)}
        className="bg-card border border-border rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer group"
      >
        <div className="flex items-start gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
            <Icon className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold mb-1">{item.label}</h3>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <SettingsIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
          <h1 className="text-lg md:text-xl font-semibold">Settings</h1>
        </div>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-5xl space-y-6 md:space-y-8">
          {/* Org Settings */}
          <div>
            <h2 className="text-xs md:text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3 md:mb-4">
              Org Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orgSettings.map(renderSettingCard)}
            </div>
          </div>

          {/* Developer */}
          <div>
            <h2 className="text-xs md:text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3 md:mb-4">
              Developer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {developerSettings.map(renderSettingCard)}
            </div>
          </div>

          {/* Community */}
          {/* <div>
            <h2 className="text-xs md:text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3 md:mb-4">
              Community
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communitySettings.map(renderSettingCard)}
            </div>
          </div> */}

          {/* Account Settings */}
          <div>
            <h2 className="text-xs md:text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3 md:mb-4">
              Account Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accountSettings.map(renderSettingCard)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

