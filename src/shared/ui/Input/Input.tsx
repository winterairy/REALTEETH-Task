import type { InputHTMLAttributes } from "react";

type InputVariant = "default" | "plain";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: InputVariant;
};

const baseClasses =
  "px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50";

export const Input = ({
  className = "",
  variant = "default",
  ...props
}: InputProps) => {
  const classes = [
    variant === "default" ? baseClasses : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <input className={classes} {...props} />;
};
