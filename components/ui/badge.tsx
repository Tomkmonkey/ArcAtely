import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
export function Badge({ className, variant = 'default', ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' }) {
  const styles = { default: 'bg-primary/10 text-primary', secondary: 'bg-secondary text-secondary-foreground', outline: 'border bg-transparent', success: 'bg-emerald-100 text-emerald-800', warning: 'bg-amber-100 text-amber-800', destructive: 'bg-red-100 text-red-800' };
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', styles[variant], className)} {...props} />;
}
