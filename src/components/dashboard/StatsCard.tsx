import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

const variantStyles = {
  default: 'bg-card',
  primary: 'bg-gradient-to-br from-brand-500 to-brand-700 text-primary-foreground',
  success: 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-primary-foreground',
  warning: 'bg-gradient-to-br from-amber-500 to-amber-700 text-primary-foreground',
};

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default' 
}: StatsCardProps) => {
  const isPrimary = variant !== 'default';

  return (
    <div className={cn(
      "rounded-xl p-4 md:p-5 shadow-medium transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-0.5 md:space-y-1 min-w-0 flex-1">
          <p className={cn(
            "text-xs md:text-sm font-medium truncate",
            isPrimary ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-2xl md:text-3xl font-bold truncate",
            isPrimary ? "text-primary-foreground" : "text-foreground"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-[10px] md:text-xs truncate",
              isPrimary ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] md:text-xs font-medium mt-1 md:mt-2",
              trend.isPositive 
                ? isPrimary ? "text-primary-foreground" : "text-success" 
                : isPrimary ? "text-primary-foreground/80" : "text-destructive"
            )}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className={cn(
                "hidden sm:inline",
                isPrimary ? "text-primary-foreground/60" : "text-muted-foreground"
              )}>
                vs. mês anterior
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-2",
          isPrimary ? "bg-primary-foreground/20" : "bg-brand-100"
        )}>
          <Icon className={cn(
            "w-5 h-5 md:w-6 md:h-6",
            isPrimary ? "text-primary-foreground" : "text-brand-600"
          )} />
        </div>
      </div>
    </div>
  );
};
