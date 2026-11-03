import * as React from 'react';
import { cn } from '@/lib/utils';
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => <textarea className={cn('flex min-h-[100px] w-full rounded-lg border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground disabled:opacity-50', className)} ref={ref} {...props} />);
Textarea.displayName = 'Textarea';
export { Textarea };
