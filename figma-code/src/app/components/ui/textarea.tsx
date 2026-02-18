import * as React from 'react';
import { clsx } from 'clsx';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={clsx(
          'flex min-h-[80px] w-full rounded-lg border border-[--dust] bg-[--bone] px-3 py-2 text-sm text-[--basalt] ring-offset-[--sand] placeholder:text-[--dust] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--clay] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
