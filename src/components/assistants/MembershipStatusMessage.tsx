import React, { useState } from 'react';
import { Phone, CreditCard, Building2, AlertCircle, Ban, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export type MembershipStatusType = 'cancelled' | 'suspended' | 'trial' | 'free' | 'expired' | 'custom';

interface MembershipStatusMessageProps {
  status: MembershipStatusType;
  title: string;
  description: string;
  primaryButtonText?: string;
  primaryButtonAction?: () => void;
  secondaryButtonText?: string;
  showContactSupport?: boolean;
  className?: string;
}

const STATUS_ICONS: Record<MembershipStatusType, React.ReactNode> = {
  cancelled: <Ban className="h-6 w-6 md:h-8 md:w-8" />,
  suspended: <AlertCircle className="h-6 w-6 md:h-8 md:w-8" />,
  trial: <Clock className="h-6 w-6 md:h-8 md:w-8" />,
  free: <Phone className="h-6 w-6 md:h-8 md:w-8" />,
  expired: <Clock className="h-6 w-6 md:h-8 md:w-8" />,
  custom: <Phone className="h-6 w-6 md:h-8 md:w-8" />,
};

const STATUS_COLORS: Record<MembershipStatusType, { bg: string; text: string; gradient: string }> = {
  cancelled: {
    bg: 'bg-destructive/10',
    text: 'text-destructive',
    gradient: 'from-destructive/5 to-destructive/10'
  },
  suspended: {
    bg: 'bg-orange-500/10',
    text: 'text-orange-600',
    gradient: 'from-orange-500/5 to-orange-500/10'
  },
  trial: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-600',
    gradient: 'from-blue-500/5 to-blue-500/10'
  },
  free: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    gradient: 'from-primary/5 to-primary/10'
  },
  expired: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-600',
    gradient: 'from-amber-500/5 to-amber-500/10'
  },
  custom: {
    bg: 'bg-primary/10',
    text: 'text-primary',
    gradient: 'from-primary/5 to-primary/10'
  }
};

export const MembershipStatusMessage: React.FC<MembershipStatusMessageProps> = ({
  status,
  title,
  description,
  primaryButtonText,
  primaryButtonAction,
  secondaryButtonText = 'Contact Support',
  showContactSupport = true,
  className
}) => {
  const [showContactSalesModal, setShowContactSalesModal] = useState(false);

  const colors = STATUS_COLORS[status];
  const icon = STATUS_ICONS[status];

  return (
    <>
      <div className={cn("flex md:items-center justify-center min-h-[calc(100vh-300px)] py-4 md:py-8 px-4", className)}>
        <div className={cn(
          "max-w-2xl w-full bg-card border border-border rounded-2xl overflow-hidden shadow-sm",
          "transition-all duration-300 hover:shadow-md"
        )}>
          {/* Gradient header accent */}
          <div className={cn("h-2 bg-gradient-to-r", colors.gradient)} />

          <div className="p-6 sm:p-8 md:p-12 text-center">
            {/* Icon with gradient background */}
            <div className="flex justify-center mb-4 md:mb-6">
              <div className={cn(
                "p-3 md:p-4 rounded-full transition-all duration-300",
                "shadow-sm hover:shadow-md",
                colors.bg
              )}>
                <div className={colors.text}>
                  {icon}
                </div>
              </div>
            </div>

            {/* Title with better typography */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 md:mb-4 tracking-tight">
              {title}
            </h2>

            {/* Description with improved readability */}
            <p className="text-muted-foreground mb-6 md:mb-8 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl mx-auto">
              {description}
            </p>

            {/* Action buttons with improved layout */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              {primaryButtonText && primaryButtonAction && (
                <Button
                  variant="default"
                  size="lg"
                  onClick={primaryButtonAction}
                  className="w-full sm:w-auto text-sm sm:text-base shadow-sm hover:shadow-md transition-all"
                >
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {primaryButtonText}
                </Button>
              )}

              {showContactSupport && (
                <Button
                  variant={primaryButtonText ? "outline" : "default"}
                  size="lg"
                  onClick={() => setShowContactSalesModal(true)}
                  className={cn(
                    "w-full sm:w-auto text-sm sm:text-base transition-all",
                    primaryButtonText ? "hover:bg-secondary" : "shadow-sm hover:shadow-md"
                  )}
                >
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {secondaryButtonText}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support Modal */}
      <Dialog open={showContactSalesModal} onOpenChange={setShowContactSalesModal}>
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
