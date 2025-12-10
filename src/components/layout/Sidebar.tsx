import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  ArrowUp,
  PhoneOutgoing,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PaymentMethodModal } from "@/components/PaymentMethodModal";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { paymentsApi } from "@/lib/api";

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

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuChange?: (open: boolean) => void;
}

export function Sidebar({ isCollapsed, onToggle, isMobileMenuOpen = false, onMobileMenuChange }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentBalance, setCurrentBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const isMobile = useIsMobile();

  // Fetch credit balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setIsLoadingBalance(true);
        const response = await paymentsApi.creditBalance();
        if (response.data) {
          setCurrentBalance(response.data.balance || 0);
        }
      } catch (error) {
        console.error("Error fetching credit balance:", error);
        setCurrentBalance(0);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
    
    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Refresh balance when payment modal closes (in case a payment was made)
  useEffect(() => {
    if (!showPaymentMethodModal) {
      const fetchBalance = async () => {
        try {
          const response = await paymentsApi.creditBalance();
          if (response.data) {
            setCurrentBalance(response.data.balance || 0);
          }
        } catch (error) {
          console.error("Error fetching credit balance:", error);
        }
      };
      fetchBalance();
    }
  }, [showPaymentMethodModal]);

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile && onMobileMenuChange) {
      onMobileMenuChange(false);
    }
  }, [location.pathname, isMobile, onMobileMenuChange]);

  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    const redirectPath = await signOut();
    if (redirectPath) {
      navigate(redirectPath);
    }
  };
  
  const renderNavItem = (item: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; path: string; badge?: string }) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">VA</span>
              </div>
              {showFullContent && (
                <span className="text-xl font-bold tracking-tight text-foreground truncate">Voiceable</span>
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
              <span className="text-sidebar-accent-foreground truncate">email@example.com's Org</span>
            </button>
          </div>
        )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Overview */}
        <NavLink
          to="/overview"
          onClick={() => {
            if (isMobile && onMobileMenuChange) {
              onMobileMenuChange(false);
            }
          }}
          className={cn(
            "sidebar-item",
            location.pathname === "/" && "sidebar-item-active",
            !showFullContent && "justify-center"
          )}
          title={!showFullContent ? "Overview" : undefined}
        >
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          {showFullContent && <span>Overview</span>}
        </NavLink>

        {/* Build Section */}
        <div>
          {showFullContent && <p className="section-label">Build</p>}
          <div className="space-y-0.5">
            {buildItems.map(renderNavItem)}
          </div>
        </div>

        {/* Evaluate Section */}
        <div>
          {showFullContent && <p className="section-label">Evaluate</p>}
          <div className="space-y-0.5">
            {evaluateItems.map(renderNavItem)}
          </div>
        </div>

        {/* Outbound Section */}
        <div>
          {showFullContent && <p className="section-label">Outbound</p>}
          <div className="space-y-0.5">
            {outboundItems.map(renderNavItem)}
          </div>
        </div>

        {/* Settings Section */}
        <div>
          {showFullContent && <p className="section-label">Settings</p>}
          <div className="space-y-0.5">
            {renderNavItem({ icon: Settings, label: "Settings", path: "/settings" })}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className={cn("p-3 border-t border-sidebar-border space-y-2", !showFullContent && "px-2")}>
        {showFullContent && (
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs bg-secondary px-2 py-1 rounded font-medium text-muted-foreground">PAYG</span>
            <span className="text-sm text-foreground">
              {isLoadingBalance ? (
                <span className="text-muted-foreground">Loading...</span>
              ) : (
                <>
                  <span className="font-medium">{currentBalance.toFixed(2)}</span>
                  <span className="text-muted-foreground"> Credits</span>
                </>
              )}
            </span>
          </div>
        )}
        <button 
          onClick={() => {
            setShowPaymentMethodModal(true);
            if (isMobile && onMobileMenuChange) {
              onMobileMenuChange(false);
            }
          }}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md bg-secondary hover:bg-secondary/80 text-sm font-medium transition-colors",
            !showFullContent && "px-2"
          )}
          title={!showFullContent ? "Buy Credits" : undefined}
        >
          <ArrowUp className="h-4 w-4 flex-shrink-0" />
          {showFullContent && <span>Buy Credits</span>}
        </button>
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
        <PaymentMethodModal
          open={showPaymentMethodModal}
          onOpenChange={setShowPaymentMethodModal}
          onSuccess={() => {
            // Redirect to billing page after successful payment
            navigate("/settings/billing");
          }}
        />
      </>
    );
  }

  // Desktop: Regular sidebar
  return (
    <>
      <aside className={cn(
        "h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 hidden md:flex",
        isCollapsed ? "w-16" : "w-60"
      )}>
        <SidebarContent />
      </aside>
      <PaymentMethodModal
        open={showPaymentMethodModal}
        onOpenChange={setShowPaymentMethodModal}
        onSuccess={() => {
          // Redirect to billing page after successful payment
          navigate("/settings/billing");
        }}
      />
    </>
  );
}
