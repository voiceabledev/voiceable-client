import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Circle, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show full navigation on home page and landing pages
  const isHomePage = location.pathname === "/";
  const isLandingPage = location.pathname === "/" || location.pathname === "/retail-ecommerce" || location.pathname === "/recruitment";
  const showFullNav = isHomePage || isLandingPage;
  // For Landing.tsx (/retail-ecommerce) and Landing3.tsx (/recruitment), only show calendar modal (no login/dashboard/pricing)
  // Landing2.tsx (/) should show login and demo call buttons
  const isCalendarOnlyPage = location.pathname === "/retail-ecommerce" || location.pathname === "/recruitment";

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 py-3 md:py-4 backdrop-blur-md bg-background/80 border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src="/voiceable_logo.png" alt="Voiceable" className="h-5 md:h-6 w-auto" fetchpriority="high" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <a href="/" className="nav-pill">Home</a>
            {showFullNav && (
              <>
                <a href="#features" className="nav-pill">How it Works</a>
                <a href="#solutions" className="nav-pill">Use Cases</a>
              </>
            )}
            {!isCalendarOnlyPage && (
              <a href="/pricing" className="nav-pill">Pricing</a>
            )}
          </nav>

          {/* Desktop CTAs */}
          {!loading && (
            <div className="hidden md:flex items-center gap-3">
              {isCalendarOnlyPage ? (
                <Button className="bg-secondary hover:bg-muted text-foreground border border-border rounded-full px-5" onClick={() => setShowCalendarModal(true)}>
                  <Circle className="w-3 h-3 fill-primary text-primary mr-2" />
                  Book a Demo
                </Button>
              ) : isAuthenticated ? (
                <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-5" onClick={() => navigate("/assistants")}>
                  Dashboard
                </Button>
              ) : (
                <>
                  {/* <Button variant="ghost" className="text-foreground hover:bg-secondary" onClick={() => navigate("/login")}>
                    Login
                  </Button> */}
                  <Button className="bg-secondary hover:bg-muted text-foreground border border-border rounded-full px-5" onClick={() => setShowCalendarModal(true)}>
                    <Circle className="w-3 h-3 fill-primary text-primary mr-2" />
                    Demo Call
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-foreground" aria-label="Open navigation menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 mt-8">
                {/* Mobile Navigation */}
                <nav className="flex flex-col gap-4">
                  <a
                    href="/"
                    className="text-foreground hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </a>
                  {showFullNav && (
                    <>
                      <a
                        href="#features"
                        className="text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        How it Works
                      </a>
                      <a
                        href="#solutions"
                        className="text-foreground hover:text-primary transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Use Cases
                      </a>
                    </>
                  )}
                  {!isCalendarOnlyPage && (
                    <a
                      href="/pricing"
                      className="text-foreground hover:text-primary transition-colors py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Pricing
                    </a>
                  )}
                </nav>

                {/* Mobile CTAs */}
                {!loading && (
                  <div className="flex flex-col gap-3 pt-4 border-t border-border">
                    {isCalendarOnlyPage ? (
                      <Button
                        className="w-full bg-secondary hover:bg-muted text-foreground border border-border rounded-full"
                        onClick={() => {
                          setShowCalendarModal(true);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Circle className="w-3 h-3 fill-primary text-primary mr-2" />
                        Book a Demo
                      </Button>
                    ) : isAuthenticated ? (
                      <Button
                        className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-full"
                        onClick={() => {
                          navigate("/assistants");
                          setMobileMenuOpen(false);
                        }}
                      >
                        Dashboard
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-foreground hover:bg-secondary"
                          onClick={() => {
                            navigate("/login");
                            setMobileMenuOpen(false);
                          }}
                        >
                          Login
                        </Button>
                        <Button
                          className="w-full bg-secondary hover:bg-muted text-foreground border border-border rounded-full"
                          onClick={() => {
                            setShowCalendarModal(true);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <Circle className="w-3 h-3 fill-primary text-primary mr-2" />
                          Demo Call
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Calendar Modal */}
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <DialogContent className="max-w-7xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
          <div className="flex-1 overflow-hidden min-h-0">
            <iframe
              src="https://cal.com/vitoroliveira/30min?overlayCalendar=true"
              className="w-full h-full border-0"
              title="Calendly Scheduling"
              allow="camera; microphone; geolocation"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Header;

