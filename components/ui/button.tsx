import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: { default: 'bg-primary text-primary-foreground hover:bg-primary/90', destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90', outline: 'border bg-card hover:bg-secondary', secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/75', ghost: 'hover:bg-secondary', link: 'text-primary underline-offset-4 hover:underline' },
    size: { default: 'h-10 px-4 py-2', sm: 'h-8 rounded-md px-3 text-xs', lg: 'h-12 rounded-xl px-6', icon: 'h-10 w-10' },
  }, defaultVariants: { variant: 'default', size: 'default' },
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, type = 'button', ...props }, ref) => <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} type={type} {...props} />);
Button.displayName = 'Button';
export { Button, buttonVariants };
