import * as React from "react";
import { clsx } from "clsx";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={clsx("text-sm font-medium text-[var(--basalt)]", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";
export { Label };
