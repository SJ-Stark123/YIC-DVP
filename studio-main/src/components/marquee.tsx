import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
}

const Marquee = ({ children, className, reverse = false }: MarqueeProps) => {
  return (
    <div
      className={cn(
        "relative flex w-full overflow-hidden",
        className
      )}
    >
      <div
        className={cn("flex min-w-full shrink-0 items-center justify-around gap-4 animate-marquee", {
          "[animation-direction:reverse]": reverse,
        })}
      >
        {children}
        {children}
      </div>
    </div>
  );
};

export default Marquee;
