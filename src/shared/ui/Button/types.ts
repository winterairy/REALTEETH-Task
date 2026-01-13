import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonBaseProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};
