// ===== src/components/ui/button.tsx =====
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "default",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-purple-600 text-white hover:bg-purple-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "hover:bg-gray-100",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} h-10 px-4 py-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
