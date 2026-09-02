"use client";

import React, { useEffect, useRef } from "react";
import DocumentRuler from "./DocumentRuler";
import { useDocumentLayout } from "@/context/DocumentLayoutContext";
import { cn } from "@/lib/utils";

interface EditorShellProps {
  children: React.ReactNode;
  showRuler?: boolean;
}

/**
 * EditorShell provides the "paper on a desk" layout:
 * - Gray desktop viewport with vertical scroll
 * - Synchronized horizontal ruler sitting above the canvas with lockstep zoom scaling
 * - Dynamically sized page canvas container supporting Letter, A4, Legal, and Pageless modes
 */
export const EditorShell: React.FC<EditorShellProps> = ({ children, showRuler = true }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const rulerScrollRef = useRef<HTMLDivElement>(null);
  const { layout } = useDocumentLayout();
  const { width, minHeight, paddingX, paddingY, isPageless, zoomFactor } = layout;

  // Synchronize horizontal scrolling between ruler and viewport at higher zoom levels
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const onScroll = () => {
      if (rulerScrollRef.current) {
        rulerScrollRef.current.scrollLeft = viewport.scrollLeft;
      }
    };

    viewport.addEventListener("scroll", onScroll, { passive: true });
    return () => viewport.removeEventListener("scroll", onScroll);
  }, []);

  const scaledWidth = width * zoomFactor;
  const scaledHeight = minHeight * zoomFactor;

  return (
    <div className="bg-surface-canvas relative flex flex-1 flex-col overflow-hidden">
      {/* Sticky Ruler Bar (hidden in Pageless mode) */}
      {showRuler && !isPageless && (
        <div className="bg-surface-canvas/90 border-border z-10 w-full shrink-0 border-b backdrop-blur-xs">
          <div ref={rulerScrollRef} className="scrollbar-none overflow-x-hidden px-4">
            <div
              className="mx-auto flex justify-center transition-all duration-200"
              style={{
                width: `${scaledWidth}px`,
              }}
            >
              <DocumentRuler
                pageWidth={width}
                marginLeft={paddingX}
                marginRight={paddingX}
                zoomFactor={zoomFactor}
              />
            </div>
          </div>
        </div>
      )}

      {/* Viewport Scroll Area */}
      <div
        ref={viewportRef}
        className={cn(
          "editor-viewport relative flex flex-1 flex-col items-center justify-start overflow-auto px-4",
          isPageless ? "py-6" : "py-8",
        )}
      >
        {/* Page Canvas Container */}
        <div
          className={cn(
            "page-canvas bg-surface relative mx-auto rounded-none transition-all duration-200",
            isPageless
              ? "mb-6 max-w-4xl border-none shadow-none"
              : "mb-12 border border-[#dadce0] shadow-md dark:border-slate-800",
          )}
          style={{
            zoom: isPageless ? undefined : `${zoomFactor}`,
            width: isPageless ? "100%" : `${width}px`,
            maxWidth: isPageless ? "960px" : `${width}px`,
            minHeight: isPageless ? "100%" : `${minHeight}px`,
            paddingLeft: `${paddingX}px`,
            paddingRight: `${paddingX}px`,
            paddingTop: `${paddingY}px`,
            paddingBottom: `${paddingY}px`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default EditorShell;
