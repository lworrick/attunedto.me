import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';

    const baseStyles =
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variantStyles = {
      primary:
        'bg-[--clay] text-[--bone] hover:bg-[--adobe] focus-visible:ring-[--clay] shadow-sm',
      secondary:
        'bg-[--sage] text-[--bone] hover:bg-[#6A7768] focus-visible:ring-[--sage] shadow-sm',
      ghost: 'hover:bg-[--bone] text-[--basalt] focus-visible:ring-[--dust]',
      outline:
        'border border-[--dust] bg-[--bone] hover:bg-[--sand] text-[--basalt] focus-visible:ring-[--dust] shadow-sm',
    };

    const sizeStyles = {
      sm: 'text-sm px-3 py-1.5 gap-1.5',
      md: 'text-base px-4 py-2 gap-2',
      lg: 'text-lg px-6 py-3 gap-2.5',
    };

    return (
      <Comp
        className={clsx(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
