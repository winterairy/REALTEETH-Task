import { useState } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
}

export const FavoritesButton = ({
  children,
  className = "",
  ...props
}: ButtonProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const baseClasses =
    "p-2 rounded-full  transition-colors hover:cursor-pointer";
  
  const showSolid = isHovered || isActive;
  const content = children ?? (
    showSolid ? (
      <StarIconSolid className="h-6 w-6" />
    ) : (
      <StarIconOutline className="h-6 w-6" />
    )
  );

  return (
    <button
      className={`${baseClasses} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      {...props}
    >
      {content}
    </button>
  );
};
