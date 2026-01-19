import { useState } from "react";
import { ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DemoCallModal } from "./DemoCallModal";

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
  const [showDemoCallModal, setShowDemoCallModal] = useState(false);

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
              setShowDemoCallModal(true);
            } else {
              window.location.href = "/login";
            }
          }}>
            {showCalendarOnly ? "Book a demo" : "Activate in minutes"}
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Demo Call Modal */}
      {showCalendarOnly && (
        <DemoCallModal
          open={showDemoCallModal}
          onOpenChange={setShowDemoCallModal}
          onSubmit={(data) => {
            console.log("Demo call requested:", data);
            // TODO: Send data to backend API to trigger the call
          }}
        />
      )}
    </section>
  );
};

export default AssistantSection;

