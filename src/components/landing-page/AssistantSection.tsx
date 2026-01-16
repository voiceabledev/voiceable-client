import { useState } from "react";
import { ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AssistantSectionProps {
  headline?: string;
  description?: string;
  showCalendarOnly?: boolean;
}

const AssistantSection = ({
  headline = "Upgrade your robo menu to an Operator that's more human",
  description = "Voiceable handles each issue uniquely based on the user and scenario. It greets by name, recalls previous issues, and follows up until each case is resolved.",
  showCalendarOnly = true
}: AssistantSectionProps) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <section id="assistant" className="py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center">
          {/* Section badge */}
          <div className="feature-pill mb-8 inline-flex">
            <MessageCircle className="w-4 h-4" />
            <span>AI Assistant</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {headline.includes('robo menu') ? (
              <>
                Upgrade your{" "}
                <span className="text-gradient-amber">robo menu</span>
                {" "}to<br />
                an Operator that's more{" "}
                <span className="text-gradient-purple relative">
                  human
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none">
                    <path d="M1 6C50 2 150 2 199 6" stroke="hsl(var(--purple))" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </>
            ) : (
              headline.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < headline.split('\n').length - 1 && <br />}
                </span>
              ))
            )}
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {description}
          </p>

          <Button variant="ghost" className="text-foreground group border-2 border-foreground" onClick={() => {
            if (showCalendarOnly) {
              setShowScheduleModal(true);
            } else {
              window.location.href = "/login";
            }
          }}>
            {showCalendarOnly ? "Book a demo" : "Activate in minutes"}
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Schedule Call Modal */}
      {showCalendarOnly && (
        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
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
      )}
    </section>
  );
};

export default AssistantSection;

