"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ToolbarPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}

export default function ToolbarPopover({
  isOpen,
  onClose,
  anchorRef,
  children,
  align = "left",
  className = "",
}: ToolbarPopoverProps): React.JSX.Element | null {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const popoverWidth = popoverRef.current?.offsetWidth || 200;

    let left = align === "right" ? rect.right - popoverWidth : rect.left;

    // Viewport overflow boundary guards
    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    setCoords({
      top: rect.bottom + 4,
      left,
    });
  }, [anchorRef, align]);

  useLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Invisible click-outside backdrop */}
      <div
        className="fixed inset-0 z-50 bg-transparent"
        onClick={onClose}
        onMouseDown={(e) => e.preventDefault()}
      />
      {/* Portal Popover Content */}
      <div
        ref={popoverRef}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          position: "fixed",
          top: coords ? `${coords.top}px` : "-9999px",
          left: coords ? `${coords.left}px` : "-9999px",
          zIndex: 60,
        }}
        className={className}
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
