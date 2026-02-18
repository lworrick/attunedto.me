import * as React from 'react';
import { clsx } from 'clsx';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={clsx(
          'flex h-10 w-full rounded-lg border border-[--dust] bg-[--bone] px-3 py-2 text-sm text-[--basalt] ring-offset-[--sand] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[--dust] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--clay] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
