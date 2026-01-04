import { useState } from "react";
import { Sparkles, Star, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CTASection = () => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple/5 to-pink/10 pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-3xl border border-border p-8 md:p-12 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
              {/* Left side */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-purple" />
                  <h2 className="text-3xl md:text-4xl font-bold">Voice Agent</h2>
                </div>
                
                <p className="text-lg text-muted-foreground mb-8">
                  Staff your phone line with an
                  agent available 24/7 in any
                  language
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6" onClick={() => {
                    setShowScheduleModal(true);
                  }}>
                    <span className="w-2 h-2 rounded-full bg-pink mr-2" />
                    Call Voice Agent
                  </Button>
                  <Button variant="ghost" className="text-foreground group" onClick={() => {
                    window.location.href = "/login";
                  }}>
                    Start for free
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>

              {/* Right side - Stats */}
              <div className="space-y-4">
                {/* Reviews */}
                <div className="flex items-center gap-3 bg-secondary/50 rounded-full px-4 py-2 w-fit">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber text-amber" />
                    ))}
                  </div>
                  <span className="text-sm">152 reviews</span>
                </div>

                {/* Features list */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green" />
                    <span className="text-muted-foreground">100% uptime over the last 30 days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">24/7 availability, day & night</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Instant human-like responses</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Integrate with any system</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Call Modal */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
            <DialogTitle>Schedule a Call</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden min-h-0">
            <iframe
              src="https://calendly.com/imvitoroliveira"
              className="w-full h-full border-0"
              title="Calendly Scheduling"
              allow="camera; microphone; geolocation"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default CTASection;

