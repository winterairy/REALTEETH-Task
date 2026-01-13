import { ListBulletIcon } from "@heroicons/react/24/outline";
import type { ButtonBaseProps } from "./types";

export const FavoritesButton = ({
  children,
  className = "",
  ...props
}: ButtonBaseProps) => {
  const baseClasses =
    "p-2 rounded-full transition-colors hover:cursor-pointer";
  
  const content = children ?? (
    <ListBulletIcon className="h-6 w-6 text-white" />
  );

  return (
    <button
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {content}
    </button>
  );
};
