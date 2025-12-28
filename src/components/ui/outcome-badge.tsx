import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OutcomeBadgeProps {
  outcome: 'success' | 'failure' | 'escalated';
  className?: string;
}

export function OutcomeBadge({ outcome, className }: OutcomeBadgeProps) {
  const config = {
    success: {
      label: 'Success',
      icon: CheckCircle2,
      variant: 'default' as const,
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    failure: {
      label: 'Failure',
      icon: XCircle,
      variant: 'destructive' as const,
      className: 'bg-red-500 hover:bg-red-600 text-white',
    },
    escalated: {
      label: 'Escalated',
      icon: AlertCircle,
      variant: 'secondary' as const,
      className: 'bg-orange-500 hover:bg-orange-600 text-white',
    },
  };

  const { label, icon: Icon, className: badgeClassName } = config[outcome];

  return (
    <Badge className={cn(badgeClassName, className)} variant={config[outcome].variant}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}

