import { Badge } from '@/components/ui/badge';
import { Smile, Meh, Frown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SentimentIndicatorProps {
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  className?: string;
}

export function SentimentIndicator({ sentiment, className }: SentimentIndicatorProps) {
  if (!sentiment) return null;

  const config = {
    positive: {
      label: 'Positive',
      icon: Smile,
      className: 'bg-green-100 text-green-700 border-green-300',
    },
    neutral: {
      label: 'Neutral',
      icon: Meh,
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    negative: {
      label: 'Negative',
      icon: Frown,
      className: 'bg-red-100 text-red-700 border-red-300',
    },
  };

  const { label, icon: Icon, className: badgeClassName } = config[sentiment];

  return (
    <Badge variant="outline" className={cn(badgeClassName, className)}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
