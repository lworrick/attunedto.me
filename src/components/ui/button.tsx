import * as React from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
    const variantStyles = {
      primary:
        "bg-[var(--clay)] text-[var(--bone)] hover:bg-[var(--adobe)] focus-visible:ring-[var(--clay)] shadow-sm",
      secondary:
        "bg-[var(--sage)] text-[var(--bone)] hover:bg-[#6A7768] focus-visible:ring-[var(--sage)] shadow-sm",
      ghost: "hover:bg-[var(--bone)] text-[var(--basalt)] focus-visible:ring-[var(--dust)]",
      outline:
        "border border-[var(--dust)] bg-[var(--bone)] hover:bg-[var(--sand)] text-[var(--basalt)] focus-visible:ring-[var(--dust)] shadow-sm",
    };
    const sizeStyles = {
      sm: "text-sm px-3 py-1.5 gap-1.5",
      md: "text-base px-4 py-2 gap-2",
      lg: "text-lg px-6 py-3 gap-2.5",
    };
    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export { Button };
