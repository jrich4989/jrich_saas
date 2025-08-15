// ===== src/components/ui/avatar.tsx =====
import React from "react";

interface AvatarProps {
  children: React.ReactNode;
  className?: string;
}

interface AvatarImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ children, className = "" }) => (
  <div
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
  >
    {children}
  </div>
);

export const AvatarFallback: React.FC<AvatarProps> = ({
  children,
  className = "",
}) => (
  <div
    className={`flex h-full w-full items-center justify-center rounded-full bg-gray-200 ${className}`}
  >
    {children}
  </div>
);

export const AvatarImage: React.FC<AvatarImageProps> = ({
  src,
  alt,
  className = "",
}) => (
  <img
    src={src}
    alt={alt}
    className={`aspect-square h-full w-full object-cover ${className}`}
  />
);
