import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
  isLoading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-neutral-900 hover:bg-primary-dark focus-visible:ring-primary-dark disabled:bg-neutral-700 disabled:text-neutral-500",
  secondary:
    "bg-transparent text-neutral-100 border border-neutral-500 hover:bg-neutral-800 focus-visible:ring-primary disabled:border-neutral-700 disabled:text-neutral-500",
  ghost:
    "text-neutral-200 hover:bg-neutral-800 focus-visible:ring-primary disabled:text-neutral-500",
  danger:
    "bg-danger text-white hover:bg-red-700 focus-visible:ring-danger disabled:bg-neutral-700 disabled:text-neutral-500",
};

const Button = ({
  variant = "primary",
  children,
  isLoading,
  className = "",
  disabled,
  ...rest
}: ButtonProps) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
    disabled={disabled || isLoading}
    {...rest}
  >
    {isLoading && (
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
    )}
    {children}
  </button>
);

export default Button;
