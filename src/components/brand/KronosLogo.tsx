import Image from "next/image";
import { cn } from "@/lib/cn";

type KronosLogoProps = {
  variant?: "auth" | "header";
  className?: string;
  priority?: boolean;
};

const sizes = {
  auth: { width: 220, height: 132, src: "/brand/kronos-logo.png" },
  header: { width: 148, height: 88, src: "/brand/kronos-logo.png" },
} as const;

export function KronosLogo({
  variant = "header",
  className,
  priority = false,
}: KronosLogoProps) {
  const { width, height, src } = sizes[variant];

  return (
    <Image
      src={src}
      alt="Kronos"
      width={width}
      height={height}
      priority={priority}
      className={cn("h-auto w-auto select-none", className)}
      sizes={variant === "auth" ? "220px" : "148px"}
    />
  );
}
