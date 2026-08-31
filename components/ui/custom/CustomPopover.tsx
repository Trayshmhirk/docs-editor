"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const CustomPopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverContent>,
  React.ComponentPropsWithoutRef<typeof PopoverContent>
>(({ className, align = "start", sideOffset = 4, onOpenAutoFocus, ...props }, ref) => (
  <PopoverContent
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    onOpenAutoFocus={(e) => {
      // Prevent stealing focus from the Lexical editor caret
      e.preventDefault();
      onOpenAutoFocus?.(e);
    }}
    className={cn(
      "border-border bg-surface text-foreground z-60 w-auto rounded-lg border p-1.5 shadow-xl outline-none select-none",
      className,
    )}
    {...props}
  />
));
CustomPopoverContent.displayName = "CustomPopoverContent";

export { Popover as CustomPopover, PopoverTrigger as CustomPopoverTrigger, CustomPopoverContent };
