import * as React from "react";
import { clsx } from "clsx";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={clsx(
        "flex h-10 w-full rounded-lg border border-[var(--dust)] bg-[var(--bone)] px-3 py-2 text-sm text-[var(--basalt)] placeholder:text-[var(--dust)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clay)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";
export { Input };
