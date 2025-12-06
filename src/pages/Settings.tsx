import { useState, useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Settings as SettingsIcon,
  Building2,
  CreditCard,
  Users,
  Link2,
  AudioLines,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  // Auto-collapse on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [location.pathname, isMobile]);

  const showFullContent = !isMobile || isExpanded;

  const renderNavItem = (item: { icon: any; label: string; path: string }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          !showFullContent && "justify-center",
          isActive 
            ? "bg-secondary text-foreground" 
            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        )}
        title={!showFullContent ? item.label : undefined}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {showFullContent && <span>{item.label}</span>}
      </NavLink>
    );
  };

  const SettingsMenuContent = () => (
    <>
      <div className="flex items-center gap-2 mb-4 md:mb-6 flex-shrink-0">
        {showFullContent && (<><SettingsIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" /><h1 className="text-lg font-semibold">Settings</h1></>)}
      </div>

      <nav className="flex-1 overflow-y-auto space-y-4 md:space-y-6 min-h-0">
        <div>
          {showFullContent && <p className="section-label mb-2">Org Settings</p>}
          <div className="space-y-1">
            {orgSettings.map(renderNavItem)}
          </div>
        </div>

        <div>
          {showFullContent && <p className="section-label mb-2">Community</p>}
          <div className="space-y-1">
            {communitySettings.map(renderNavItem)}
          </div>
        </div>

        <div>
          {showFullContent && <p className="section-label mb-2">Account Settings</p>}
          <div className="space-y-1">
            {accountSettings.map(renderNavItem)}
          </div>
        </div>
      </nav>
    </>
  );

  return (
    <div className={cn(
      "flex overflow-hidden",
      isMobile ? "absolute top-[73px] left-0 right-0 bottom-0" : "absolute inset-0"
    )}>
      {/* Settings Sidebar - Always visible, collapsible on mobile */}
      <div className={cn(
        "border-r border-border flex flex-col transition-all duration-300 h-full overflow-hidden",
        isMobile 
          ? (isExpanded ? "w-64" : "w-16")
          : "w-64"
      )}>
        <div className="p-3 md:p-4 flex flex-col h-full overflow-hidden">
          <SettingsMenuContent />
          
          {/* Expand/Collapse Button - Fixed at Bottom */}
          {isMobile && (
            <div className="mt-auto pt-3 md:pt-4 pb-3 md:pb-4 border-t border-border flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "w-full h-9 md:h-8 flex items-center justify-center",
                  !showFullContent ? "px-0" : "px-3 md:px-4"
                )}
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse menu" : "Expand menu"}
              >
                {isExpanded ? (
                  <>
                    <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                    {showFullContent && <span className="ml-2 text-sm">Collapse</span>}
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    {showFullContent && <span className="ml-2 text-sm">Expand</span>}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Settings Content - Scrollable */}
      <div className="flex-1 p-4 md:p-6 relative min-w-0 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
