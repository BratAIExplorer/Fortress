import * as React from "react"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", ...props }, ref) => (
    <input
      type="checkbox"
      ref={ref}
      className={`h-4 w-4 rounded border border-primary/30 bg-background cursor-pointer accent-primary ${className}`}
      {...props}
    />
  )
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
