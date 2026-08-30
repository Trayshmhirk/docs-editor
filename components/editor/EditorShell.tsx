"use client";

import React, { useRef } from "react";
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
 * - Synchronized horizontal ruler sitting above the canvas
 * - Dynamically sized page canvas container supporting Letter, A4, Legal, and Pageless modes
 */
export const EditorShell: React.FC<EditorShellProps> = ({ children, showRuler = true }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const { layout } = useDocumentLayout();
  const { width, minHeight, paddingX, paddingY, isPageless } = layout;

  return (
    <div className="bg-surface-canvas relative flex flex-1 flex-col overflow-hidden">
      {/* Sticky Ruler Bar (hidden in Pageless mode) */}
      {showRuler && !isPageless && (
        <div className="bg-surface-canvas/90 border-border z-10 w-full shrink-0 border-b backdrop-blur-xs">
          <div className="overflow-x-hidden px-4 py-1 sm:px-8">
            <DocumentRuler pageWidth={width} marginLeft={paddingX} marginRight={paddingX} />
          </div>
        </div>
      )}

      {/* Viewport Scroll Area */}
      <div
        ref={viewportRef}
        className={cn(
          "editor-viewport relative flex flex-1 flex-col items-center justify-start overflow-y-auto px-4",
          isPageless ? "py-6 sm:px-12" : "py-8 sm:px-8 sm:py-10",
        )}
      >
        {/* Page Canvas Container */}
        <div
          className={cn(
            "page-canvas bg-surface relative w-full rounded-none transition-all duration-200",
            isPageless
              ? "mb-6 max-w-4xl border-none shadow-none"
              : "mb-12 border border-[#dadce0] shadow-md dark:border-slate-800",
          )}
          style={{
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
