import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TourStep {
  id: string;
  target: string; // data-tour-target attribute value
  title: string;
  description: string;
}

interface AssistantDetailTourProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  steps: TourStep[];
}

export function AssistantDetailTour({ open, onClose, onComplete, steps }: AssistantDetailTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [spotlightPosition, setSpotlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const currentStepData = steps[currentStep];

  // Reset to first step when tour opens
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      console.log("Tour opened", { stepsLength: steps.length, firstStep: steps[0] });
    }
  }, [open, steps]);

  // Debug logging
  useEffect(() => {
    if (open) {
      console.log("Tour step changed", { currentStep, stepsLength: steps.length, currentStepData });
    }
  }, [open, currentStep, steps.length, currentStepData]);

  // Update spotlight position when step changes or window resizes
  useEffect(() => {
    if (!open || !currentStepData) return;

    let retryCount = 0;
    const maxRetries = 10;
    let retryTimeoutId: NodeJS.Timeout | null = null;

    const updatePosition = () => {
      const element = document.querySelector(`[data-tour-target="${currentStepData.target}"]`) as HTMLElement;
      if (!element) {
        setTargetElement(null);
        setSpotlightPosition(null);
        setTooltipPosition(null);
        // Retry after a short delay if element not found
        if (retryCount < maxRetries) {
          retryCount++;
          retryTimeoutId = setTimeout(() => {
            updatePosition();
          }, 200);
        } else {
          console.warn(`Tour element not found after ${maxRetries} retries: ${currentStepData.target}`);
        }
        return;
      }
      
      retryCount = 0; // Reset retry count on success

      setTargetElement(element);
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      setSpotlightPosition({
        top: rect.top + scrollY,
        left: rect.left + scrollX,
        width: rect.width,
        height: rect.height,
      });

      // Position tooltip to the right of the element, or below if not enough space
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const spacing = 16;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let tooltipTop = rect.top + scrollY + rect.height / 2 - tooltipHeight / 2;
      let tooltipLeft = rect.right + scrollX + spacing;

      // If tooltip would go off screen to the right, position it to the left
      if (tooltipLeft + tooltipWidth > viewportWidth + scrollX) {
        tooltipLeft = rect.left + scrollX - tooltipWidth - spacing;
      }

      // If tooltip would go off screen to the left, position it below
      if (tooltipLeft < scrollX) {
        tooltipLeft = rect.left + scrollX + rect.width / 2 - tooltipWidth / 2;
        tooltipTop = rect.bottom + scrollY + spacing;
      }

      // If tooltip would go off screen at bottom, position it above
      if (tooltipTop + tooltipHeight > viewportHeight + scrollY) {
        tooltipTop = rect.top + scrollY - tooltipHeight - spacing;
      }

      // Ensure tooltip stays within viewport
      tooltipLeft = Math.max(scrollX + 16, Math.min(tooltipLeft, viewportWidth + scrollX - tooltipWidth - 16));
      tooltipTop = Math.max(scrollY + 16, Math.min(tooltipTop, viewportHeight + scrollY - tooltipHeight - 16));

      setTooltipPosition({ top: tooltipTop, left: tooltipLeft });
    };

    // Wait a bit for DOM to be ready, then update position
    const initialTimeoutId = setTimeout(() => {
      updatePosition();
      
      // Scroll element into view after a short delay
      setTimeout(() => {
        const element = document.querySelector(`[data-tour-target="${currentStepData.target}"]`) as HTMLElement;
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
          // Wait for scroll to complete before updating position
          setTimeout(updatePosition, 500);
        }
      }, 100);
    }, 100);

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      clearTimeout(initialTimeoutId);
      if (retryTimeoutId) {
        clearTimeout(retryTimeoutId);
      }
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, currentStep, currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    onComplete();
    setCurrentStep(0);
  };

  if (!open) {
    return null;
  }

  if (!currentStepData) {
    console.warn("Tour is open but no current step data", { open, currentStep, stepsLength: steps.length });
    return null;
  }

  return (
    <>
      {/* Overlay with spotlight effect */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[9998] pointer-events-auto"
        onClick={(e) => {
          // Only close on overlay click, not on tooltip click
          if (e.target === overlayRef.current) {
            handleSkip();
          }
        }}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          ...(spotlightPosition && {
            clipPath: `polygon(
              0% 0%, 
              0% 100%, 
              ${spotlightPosition.left}px 100%, 
              ${spotlightPosition.left}px ${spotlightPosition.top}px, 
              ${spotlightPosition.left + spotlightPosition.width}px ${spotlightPosition.top}px, 
              ${spotlightPosition.left + spotlightPosition.width}px ${spotlightPosition.top + spotlightPosition.height}px, 
              ${spotlightPosition.left}px ${spotlightPosition.top + spotlightPosition.height}px, 
              ${spotlightPosition.left}px 100%, 
              100% 100%, 
              100% 0%
            )`,
          }),
        }}
      >
        {/* Highlight border around spotlight */}
        {spotlightPosition && (
          <div
            className="fixed pointer-events-none border-2 border-primary rounded-md"
            style={{
              top: `${spotlightPosition.top - 2}px`,
              left: `${spotlightPosition.left - 2}px`,
              width: `${spotlightPosition.width + 4}px`,
              height: `${spotlightPosition.height + 4}px`,
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2)',
            }}
          />
        )}
      </div>

      {/* Tooltip Card */}
      {tooltipPosition && (
        <Card
          className="fixed z-[9999] w-80 shadow-2xl border-primary/50"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                <CardDescription className="mt-2 text-sm leading-relaxed">
                  {currentStepData.description}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mt-1 -mr-1"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  size="sm"
                  onClick={handleNext}
                >
                  {currentStep === steps.length - 1 ? "Finish" : "Next"}
                  {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

