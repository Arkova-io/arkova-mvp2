/**
 * Stat Card Component
 *
 * Displays a metric with label and optional trend indicator.
 */

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning' | 'primary';
  loading?: boolean;
  description?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: {
    iconColor: 'text-muted-foreground',
    valueColor: 'text-foreground',
  },
  primary: {
    iconColor: 'text-primary',
    valueColor: 'text-foreground',
  },
  success: {
    iconColor: 'text-success',
    valueColor: 'text-[#00e5c8]',
  },
  warning: {
    iconColor: 'text-warning',
    valueColor: 'text-amber-400',
  },
};

export function StatCard({
  label,
  value,
  icon: Icon,
  variant = 'default',
  loading = false,
  description,
  onClick,
}: Readonly<StatCardProps>) {
  const styles = variantStyles[variant];

  if (loading) {
    return (
      <Card className="border-white/[0.06] bg-white/[0.02]">
        <CardContent className="p-5">
          <div className="space-y-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'transition-all border-white/[0.06] hover:border-[#00d4ff]/20 bg-white/[0.02] hover:bg-white/[0.03]',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className={cn('text-[28px] font-bold tracking-tight leading-none mb-1', styles.valueColor)}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {label}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground/60 mt-1">
                {description}
              </p>
            )}
          </div>
          <Icon className={cn('h-5 w-5 mt-1', styles.iconColor, 'opacity-40')} />
        </div>
      </CardContent>
    </Card>
  );
}
