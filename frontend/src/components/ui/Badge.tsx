import type { ReactNode } from "react";

type BadgeVariant = "free" | "reserved" | "collecting" | "complete" | "underfunded";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  free: "bg-neutral-50 text-neutral-700",
  reserved: "bg-primary-soft text-primary",
  collecting: "bg-primary-soft text-primary",
  complete: "bg-green-100 text-success",
  underfunded: "bg-yellow-100 text-amber-700",
};

const Badge = ({ variant, children }: BadgeProps) => (
  <span
    className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
  >
    {children}
  </span>
);

export default Badge;
