import type { ReactNode } from "react";

type BadgeVariant = "free" | "reserved" | "collecting" | "complete" | "underfunded";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  free: "bg-neutral-800 text-neutral-300",
  reserved: "bg-primary-soft/40 text-primary",
  collecting: "bg-primary-soft/40 text-primary",
  complete: "bg-green-500/20 text-success",
  underfunded: "bg-yellow-500/20 text-yellow-300",
};

const Badge = ({ variant, children }: BadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}
  >
    {children}
  </span>
);

export default Badge;
