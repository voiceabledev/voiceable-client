import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuChange={setIsMobileMenuOpen}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {isMobile && (
          <div className="flex-shrink-0 z-40 bg-background border-b border-border p-4 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
