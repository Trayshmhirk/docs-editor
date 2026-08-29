"use client";

import React, { useRef } from "react";
import DocumentRuler from "./DocumentRuler";

interface EditorShellProps {
  children: React.ReactNode;
  pageWidth?: number;
  marginLeft?: number;
  marginRight?: number;
  showRuler?: boolean;
}

/**
 * EditorShell provides the "paper on a desk" layout:
 * - Gray desktop viewport with vertical scroll
 * - Synchronized horizontal ruler sitting above the canvas
 * - Centered 816px (US Letter) white page canvas container
 */
export const EditorShell: React.FC<EditorShellProps> = ({
  children,
  pageWidth = 816,
  marginLeft = 96,
  marginRight = 96,
  showRuler = true,
}) => {
  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-surface-canvas relative flex flex-1 flex-col overflow-hidden">
      {/* Sticky Ruler Bar */}
      {showRuler && (
        <div className="bg-surface-canvas/90 border-border z-10 w-full shrink-0 border-b backdrop-blur-xs">
          <div className="overflow-x-hidden px-4 py-1 sm:px-8">
            <DocumentRuler
              pageWidth={pageWidth}
              marginLeft={marginLeft}
              marginRight={marginRight}
            />
          </div>
        </div>
      )}

      {/* Viewport Scroll Area */}
      <div
        ref={viewportRef}
        className="editor-viewport relative flex flex-1 flex-col items-center justify-start overflow-y-auto px-4 py-8 sm:px-8 sm:py-10"
      >
        {/* Centered Page Canvas Paper Shell */}
        <div
          className="page-canvas relative mb-12 w-full rounded-none transition-shadow duration-200"
          style={{
            maxWidth: `${pageWidth}px`,
            paddingLeft: `${marginLeft}px`,
            paddingRight: `${marginRight}px`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default EditorShell;
