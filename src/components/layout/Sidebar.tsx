"use client";

import { useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Phone,
  AudioLines,
  Key,
  FileText,
  MessageSquare,
  Search,
  PhoneOutgoing,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Shield,
  Users2,
  Plug,
  BarChart3,
  AlertCircle,
  // Contact,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const buildItems = [
  { icon: Users, label: "Agents", path: "/assistants" },
  // { icon: GitBranch, label: "Workflows", path: "/workflows" },
  // { icon: Phone, label: "Phone Numbers", path: "/phone-numbers" },
  // { icon: FileText, label: "Knowledge Base", path: "/files" },
  // { icon: AudioLines, label: "Voice Library", path: "/voice-library" },
  { icon: Key, label: "Integrations", path: "/settings/integrations" },
];

const evaluateItems = [
  { icon: MessageSquare, label: "Conversations", path: "/conversations" },
];

// CRM > People hidden for now
// const crmItems = [
//   { icon: Contact, label: "People", path: "/people" },
// ];

const outboundItems = [
  { icon: PhoneOutgoing, label: "Campaigns", path: "/outbound" },
];

const settingsItems = [
  { icon: Settings, label: "Settings", path: "/settings" },
];

const adminItems = [
  { icon: Shield, label: "Admin Panel", path: "/admin/users" },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuChange?: (open: boolean) => void;
}

export function Sidebar({ isCollapsed, onToggle, isMobileMenuOpen = false, onMobileMenuChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, isAdmin } = useAuth();
  const isMobile = useIsMobile();

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile && onMobileMenuChange) {
      onMobileMenuChange(false);
    }
  }, [pathname, isMobile, onMobileMenuChange]);

  const handleSignOut = async () => {
    const redirectPath = await signOut();
    if (redirectPath) {
      router.push(redirectPath);
    }
  };
  
  const renderNavItem = (item: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; path: string; badge?: string }) => {
    const Icon = item.icon;
    const isActive = pathname === item.path;
    // On mobile, always show full content (not collapsed)
    const showFullContent = isMobile || !isCollapsed;

    const handleClick = () => {
      // Close mobile menu when navigation link is clicked
      if (isMobile && onMobileMenuChange) {
        onMobileMenuChange(false);
      }
    };

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={handleClick}
        className={cn(
          "sidebar-item",
          isActive && "sidebar-item-active",
          !showFullContent && "justify-center"
        )}
        title={!showFullContent ? item.label : undefined}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {showFullContent && <span>{item.label}</span>}
        {showFullContent && item.badge && (
          <span className="ml-auto text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded font-medium">
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  const SidebarContent = () => {
    // On mobile, always show full content (not collapsed)
    const showFullContent = isMobile || !isCollapsed;
    
    return (
      <>
        {/* Logo and Toggle */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {showFullContent && (
                <span className="text-xl font-bold tracking-tight text-foreground truncate">Upriser</span>
              )}
            </div>
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                onClick={onToggle}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Org Selector */}
        {showFullContent && (
          <div className="px-3 py-3 border-b border-sidebar-border">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-sidebar-accent text-sm">
              <span className="w-5 h-5 rounded bg-primary/20 text-primary flex items-center justify-center text-xs font-medium">
                V
              </span>
              <span className="text-sidebar-accent-foreground truncate">{user?.email ? `${user.email}'s Org` : 'Organization'}</span>
            </button>
          </div>
        )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Overview */}
        {/* <NavLink
          to="/overview"
          onClick={() => {
            if (isMobile && onMobileMenuChange) {
              onMobileMenuChange(false);
            }
          }}
          className={cn(
            "sidebar-item",
            pathname === "/" && "sidebar-item-active",
            !showFullContent && "justify-center"
          )}
          title={!showFullContent ? "Overview" : undefined}
        >
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          {showFullContent && <span>Overview</span>}
        </NavLink> */}

        {/* Build Section */}
        <div>
          {showFullContent && <p className="section-label">Build</p>}
          <div className="space-y-0.5">
            {buildItems.map(renderNavItem)}
          </div>
        </div>

        {/* Evaluate Section */}
        {/* <div>
          {showFullContent && <p className="section-label">Evaluate</p>}
          <div className="space-y-0.5">
            {evaluateItems.map(renderNavItem)}
          </div>
        </div> */}

        {/* Outbound Section */}
        <div>
          {showFullContent && <p className="section-label">Outbound</p>}
          <div className="space-y-0.5">
            {outboundItems.map(renderNavItem)}
          </div>
        </div>

        {/* CRM Section — People hidden for now */}
        {/* <div>
          {showFullContent && <p className="section-label">CRM</p>}
          <div className="space-y-0.5">
            {crmItems.map(renderNavItem)}
          </div>
        </div> */}

        {/* Settings Section */}
        <div>
          {showFullContent && <p className="section-label">Settings</p>}
          <div className="space-y-0.5">
            {settingsItems.map(renderNavItem)}
          </div>
        </div>

        {/* Admin Section - Only visible to admins */}
        {isAdmin && (
          <div>
            {showFullContent && <p className="section-label">Admin</p>}
            <div className="space-y-0.5">
              {adminItems.map(renderNavItem)}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={cn("p-3 border-t border-sidebar-border space-y-2", !showFullContent && "px-2")}>
        <button
          onClick={() => {
            handleSignOut();
            if (isMobile && onMobileMenuChange) {
              onMobileMenuChange(false);
            }
          }}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50 text-sm font-medium transition-colors",
            !showFullContent && "px-2"
          )}
          title={!showFullContent ? "Sign Out" : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {showFullContent && <span>Sign Out</span>}
        </button>
      </div>
    </>
  );
  };

  // Mobile: Use Sheet component
  if (isMobile) {
    return (
      <>
        <Sheet open={isMobileMenuOpen} onOpenChange={onMobileMenuChange}>
          <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border">
            <div className="h-full flex flex-col">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: Regular sidebar
  return (
    <>
      <aside className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 hidden md:flex flex-col",
        isCollapsed ? "w-16" : "w-60"
      )}>
        <SidebarContent />
      </aside>
    </>
  );
}
