import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Star, Mic } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DemoCallModal } from "./DemoCallModal";

interface HeroSectionProps {
  badgeText?: string;
  headline?: string;
  subtitle?: string;
  tagline?: string;
  socialProofText?: string;
  showBadge?: boolean;
  primaryCtaLabel?: string;
  primaryCtaAction?: "demo" | "calendar";
  secondaryCtaLabel?: string;
  secondaryCtaAction?: "demo" | "calendar" | "anchor";
  secondaryAnchorId?: string;
  previewName?: string;
  previewMeta?: string;
  previewStatus?: string;
}

const HeroSection = ({
  badgeText = "Answer every call, 24/7",
  headline = "Convert leads & resolve\nissues with a 24/7 support\nline",
  subtitle = "Voiceable is purpose-built to automate customer service for retail & e-commerce. Powered by AI and humans, it works seamlessly with phone lines & systems to handle orders, inquiries, and support - 24/7, day or night.",
  tagline,
  socialProofText = "Trusted by Retailers & E-commerces",
  showBadge = true,
  primaryCtaLabel = "Talk to Voiceable Agent",
  primaryCtaAction = "demo",
  secondaryCtaLabel,
  secondaryCtaAction = "demo",
  secondaryAnchorId = "demo",
  previewName = "Sarah",
  previewMeta = "Order #12345 - Delivery status",
  previewStatus = "Order updated in system"
}: HeroSectionProps) => {
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showDemoCallModal, setShowDemoCallModal] = useState(false);

  const handleCta = (action: "demo" | "calendar" | "anchor") => {
    if (action === "calendar") {
      setShowCalendarModal(true);
      return;
    }

    if (action === "anchor") {
      document.getElementById(secondaryAnchorId)?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setShowDemoCallModal(true);
  };

  const headlineLines = headline.split("\n");

  return (
    <>
      <section className="mt-3 relative min-h-screen flex flex-col items-center justify-center pt-40 pb-32 overflow-hidden">
        {/* Warm glow effect */}
        <div className="hero-glow" />

        <div className="container mx-auto px-6 text-center relative z-10">
          {showBadge && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-8 animate-fade-in">
              <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">✨</span>
              </div>
              <span className="text-sm text-primary font-medium">{badgeText}</span>
            </div>
          )}

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 animate-slide-up">
            {headlineLines.map((line, i) => {
              const parts = line.split('24/7');
              return (
                <span key={i}>
                  {parts.map((part, j) => (
                    <span key={j}>
                      {part}
                      {j < parts.length - 1 && <span className="text-gradient-amber">24/7</span>}
                    </span>
                  ))}
                  {i < headlineLines.length - 1 && <br />}
                </span>
              );
            })}
          </h1>

          {/* Subtitle — smooth staged reveal */}
          <p
            className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6 md:mb-7 animate-hero-text"
            style={{ animationDelay: "140ms" }}
          >
            {subtitle}
          </p>
          {tagline && (
            <p
              className="text-base text-muted-foreground/90 md:text-lg font-medium tracking-tight max-w-3xl mx-auto mb-8 animate-hero-text"
              style={{ animationDelay: "300ms" }}
            >
              {tagline}
            </p>
          )}

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: "480ms" }}>
            <Button
              className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-7 py-6"
              onClick={() => handleCta(primaryCtaAction)}
            >
              {primaryCtaLabel}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            {secondaryCtaLabel && (
              <Button
                variant="ghost"
                className="text-foreground hover:bg-secondary/50 group border-2 border-foreground rounded-full px-7 py-6"
                onClick={() => handleCta(secondaryCtaAction)}
              >
                {secondaryCtaLabel}
                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>

          {/* Hero visual area */}
          <div className="mt-8 md:mt-32 flex flex-col md:flex-row items-center justify-center gap-8 animate-slide-up" style={{ animationDelay: "560ms" }}>
            {/* Phone mockup placeholder */}
            <div className="relative w-full max-w-[280px] md:w-72">
              <div className="w-full aspect-[9/16] max-h-[500px] rounded-[2rem] md:rounded-[3rem] bg-gradient-to-b from-card to-background border border-border overflow-hidden shadow-2xl">
                {/* Phone notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-6 bg-background rounded-full" />

                {/* Phone content */}
                <div className="mt-16 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-purple/30 shadow-lg">
                        <AvatarFallback className="bg-gradient-to-br from-purple via-pink to-purple text-background flex items-center justify-center">
                          <Mic className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Voice Agent</span>
                        <span className="text-xs text-muted-foreground">AI Assistant</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green flex items-center justify-center">
                      <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>

                  {/* Message preview */}
                  <div className="mt-8 bg-card rounded-2xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{previewName}</span>
                      <span className="text-xs text-muted-foreground">7:31 PM</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{previewMeta}</p>
                    <div className="flex items-center gap-2 text-green text-xs">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {previewStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social proof */}
            <div className="flex flex-col gap-6 text-left">
              <div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Loved by users: 4.8 / 5.0</p>
              </div>

              <div>
                <div className="flex -space-x-2 mb-2">
                  {[
                    "https://i.pravatar.cc/150?img=12",
                    "https://i.pravatar.cc/150?img=33",
                    "https://i.pravatar.cc/150?img=47",
                    "https://i.pravatar.cc/150?img=68",
                    "https://i.pravatar.cc/150?img=51",
                    "https://i.pravatar.cc/150?img=32"
                  ].map((avatar, i) => (
                    <Avatar
                      key={i}
                      className="w-8 h-8 border-2 border-background"
                    >
                      <AvatarImage src={avatar} alt={`User ${i + 1}`} />
                      <AvatarFallback className="bg-gradient-to-br from-muted to-card" />
                    </Avatar>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{socialProofText}</p>
              </div>

              <div>
                <div className="flex gap-1 mb-2 flex-wrap">
                  {[
                    { name: "Salesforce", logo: "https://cdn.simpleicons.org/salesforce/00A1E0", color: "#00A1E0" },
                    { name: "HubSpot", logo: "https://cdn.simpleicons.org/hubspot/FF7A59", color: "#FF7A59" },
                    { name: "Slack", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/slack.svg", color: "#4A154B" },
                    { name: "Zapier", logo: "https://cdn.simpleicons.org/zapier/FF4A00", color: "#FF4A00" },
                    { name: "Google", logo: "https://cdn.simpleicons.org/google/4285F4", color: "#4285F4" },
                    { name: "Microsoft", logo: "https://cdn.jsdelivr.net/npm/simple-icons@v16/icons/microsoft.svg", color: "#00A4EF" },
                    { name: "Stripe", logo: "https://cdn.simpleicons.org/stripe/635BFF", color: "#635BFF" },
                    { name: "Airtable", logo: "https://cdn.simpleicons.org/airtable/18BFFF", color: "#18BFFF" }
                  ].map((integration, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors"
                      title={integration.name}
                    >
                      <img
                        src={integration.logo}
                        alt={integration.name}
                        className="w-5 h-5 object-contain"
                        onError={(e) => {
                          // Fallback to colored box if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.style.backgroundColor = integration.color;
                          }
                        }}
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Integrates with your stack</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Modal */}
      <Dialog open={showCalendarModal} onOpenChange={setShowCalendarModal}>
        <DialogContent className="max-w-7xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
          <div className="flex-1 overflow-hidden min-h-0">
            <iframe
              src="https://cal.com/voiceabledev/30min?overlayCalendar=true"
              className="w-full h-full border-0"
              title="Calendly Scheduling"
              allow="camera; microphone; geolocation"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Demo Call Modal */}
      <DemoCallModal
        open={showDemoCallModal}
        onOpenChange={setShowDemoCallModal}
        onSubmit={(data) => {
          console.log("Demo call requested:", data);
          // TODO: Send data to backend API to trigger the call
          // You can add API call here to submit the form data
        }}
      />
    </>
  );
};

export default HeroSection;

