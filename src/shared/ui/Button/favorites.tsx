import type { ButtonHTMLAttributes, ReactNode } from "react";
import { StarIcon } from "@heroicons/react/24/outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export const FavoritesButton = ({
  children,
  className = "",
  ...props
}: ButtonProps) => {
  const baseClasses =
    "p-2 rounded-full  transition-colors hover:cursor-pointer";
  const content = children ?? <StarIcon className="h-6 w-6" />;

  return (
    <button className={`${baseClasses} ${className}`} {...props}>
      {content}
    </button>
  );
};
