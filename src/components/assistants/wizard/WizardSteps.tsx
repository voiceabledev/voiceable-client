import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepType } from "./types";
import { PRIMARY_OUTCOMES } from "@/constants/outcomes";

interface StepsProps {
  numSteps: number;
  currentStep: number;
  steps: StepType[];
}

export const Steps = ({ numSteps, currentStep, steps }: StepsProps) => {
  return (
    <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isActive = isCompleted || isCurrent;
        const Icon = step.icon;

        return (
          <React.Fragment key={stepNum}>
            <Step 
              num={stepNum} 
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              icon={Icon} 
              label={step.label} 
            />
            {stepNum !== numSteps && (
              <div className={cn(
                "flex-1 h-0.5 rounded-full relative transition-colors",
                isCompleted ? "bg-primary" : "bg-muted"
              )}>
                {/* Thick line for completed connections */}
                {isCompleted && (
                  <div className="absolute left-0 right-0 -top-0.5 bottom-0 bg-primary h-1 rounded-full" />
                )}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

interface StepProps {
  num: number;
  isCompleted: boolean;
  isCurrent: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const Step = ({ 
  num, 
  isCompleted,
  isCurrent,
  icon: Icon, 
  label 
}: StepProps) => {
  const isActive = isCompleted || isCurrent;
  
  return (
    <div className="relative flex flex-col items-center gap-2 min-w-[80px]">
      <div className="relative">
        {/* Glow effect for current step */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
        
        {/* Step circle */}
        <div
          className={cn(
            "w-10 h-10 flex items-center justify-center shrink-0 rounded-full font-semibold text-sm relative z-10 transition-all duration-300",
            isCompleted
              ? "bg-primary border-2 border-primary text-primary-foreground"
              : isCurrent
              ? "bg-primary border-2 border-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary/20"
              : "border-2 border-muted-foreground/30 text-muted-foreground bg-background"
          )}
        >
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                key="icon-check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="icon-step"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon className={cn(
                  "h-5 w-5",
                  isCurrent ? "text-primary-foreground" : "text-muted-foreground"
                )} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <span className={cn(
        "text-xs font-medium text-center",
        isActive ? "text-foreground font-semibold" : "text-muted-foreground"
      )}>
        {label}
      </span>
    </div>
  );
};
