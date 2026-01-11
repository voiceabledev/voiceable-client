import { Outlet, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  FileText,
  Settings,
  Menu,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

interface NavCategory {
  label: string;
  items: NavItem[];
}

const adminNavCategories: NavCategory[] = [
  {
    label: "Users & Agents",
    items: [
      { icon: Users, label: "Users", path: "/admin/users" },
      { icon: Users2, label: "Agents", path: "/admin/agents" },
      { icon: FileText, label: "Templates", path: "/admin/templates" },
      { icon: Settings, label: "Behaviours", path: "/admin/behaviours" },
    ],
  },
  {
    label: "Integrations & Access",
    items: [
      { icon: Plug, label: "Integrations", path: "/admin/integrations" },
      { icon: Key, label: "API Keys", path: "/admin/api-keys" },
    ],
  },
  {
    label: "Communication",
    items: [
      { icon: PhoneOutgoing, label: "Campaigns", path: "/admin/campaigns" },
      { icon: Phone, label: "Phone Numbers", path: "/admin/phone-numbers" },
    ],
  },
  {
    label: "Financial",
    items: [
      { icon: CreditCard, label: "Payments", path: "/admin/payments" },
      { icon: TrendingDown, label: "Conversation Spending", path: "/admin/conversation-spending" },
      { icon: Calculator, label: "Financial Simulation", path: "/admin/financial-simulation" },
      { icon: DollarSign, label: "Pricing Settings", path: "/admin/pricing-settings" },
    ],
  },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(120);
  const [footerHeight, setFooterHeight] = useState(60);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    const updateFooterHeight = () => {
      if (footerRef.current) {
        setFooterHeight(footerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    updateFooterHeight();
    window.addEventListener('resize', () => {
      updateHeaderHeight();
      updateFooterHeight();
    });
    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      window.removeEventListener('resize', updateFooterHeight);
    };
  }, []);

  const renderNavContent = (isMobile = false) => (
    <nav className={cn("space-y-6", isMobile ? "p-4" : "p-4")}>
      {adminNavCategories.map((category) => (
        <div key={category.label} className="space-y-2">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {category.label}
          </h3>
          <div className="space-y-1">
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
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
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div ref={headerRef} className="p-4 md:p-6 border-b border-border flex-shrink-0 bg-card/50 backdrop-blur-sm z-30 fixed top-0 left-0 right-0">
        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/assistants")}
            className="flex-shrink-0 hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden flex-shrink-0 hover:bg-secondary"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
              <SheetHeader className="px-4 sm:px-6 pt-6 pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  <SheetTitle className="text-base sm:text-lg font-bold">Admin Menu</SheetTitle>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto">
                {renderNavContent(true)}
              </div>
            </SheetContent>
          </Sheet>
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

      <div className="flex-1 flex overflow-hidden" style={{ marginTop: `${headerHeight}px` }}>
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <aside 
          className="hidden md:block w-64 border-r border-border bg-card/50 flex-shrink-0 fixed left-0 overflow-y-auto z-10" 
          style={{ top: `${headerHeight}px`, height: `calc(100vh - ${headerHeight}px - ${footerHeight}px)` }}
        >
          {renderNavContent(false)}
        </aside>

        {/* Main Content - Responsive margin */}
        <div className="flex-1 overflow-hidden md:ml-64 flex flex-col">
          <div className="flex-1 overflow-y-auto pb-[var(--footer-height)]" style={{ paddingBottom: `${footerHeight}px` }}>
            <Outlet />
          </div>
        </div>
      </div>

      {/* Footer - Fixed with responsive margin */}
      <footer 
        ref={footerRef}
        className="border-t border-border flex-shrink-0 bg-card/50 backdrop-blur-sm z-20 fixed left-0 right-0 md:left-64 bottom-0"
      >
        <div className="p-4 md:p-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
              Admin Panel - Manage all system resources
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">
              © {new Date().getFullYear()} Voice Agent App
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
