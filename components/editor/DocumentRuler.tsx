"use client";

import React from "react";

interface DocumentRulerProps {
  pageWidth?: number; // default: 816 (8.5in * 96dpi)
  marginLeft?: number; // default: 96 (1in * 96dpi)
  marginRight?: number; // default: 96 (1in * 96dpi)
}

/**
 * Pixel-accurate horizontal document ruler matching Google Docs.
 * Displays inch markings (0 to 8.5) and shaded margin zones.
 */
export const DocumentRuler: React.FC<DocumentRulerProps> = ({
  pageWidth = 816,
  marginLeft = 96,
  marginRight = 96,
}) => {
  const totalInches = 8.5;
  const pixelsPerInch = 96;
  const eighthInch = pixelsPerInch / 8; // 12px

  // Generate 1/8 inch tick intervals across the 8.5 inch span
  const tickCount = Math.floor(pageWidth / eighthInch);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const position = i * eighthInch;
    const isInch = i % 8 === 0;
    const isHalfInch = i % 4 === 0 && !isInch;
    const isQuarterInch = i % 2 === 0 && !isInch && !isHalfInch;
    const inchNumber = isInch ? i / 8 : null;

    let height = "h-1"; // 1/8" tick
    if (isQuarterInch) height = "h-1.5";
    if (isHalfInch) height = "h-2";
    if (isInch) height = "h-2.5";

    return {
      index: i,
      position,
      isInch,
      inchNumber,
      height,
    };
  });

  const activeWidth = Math.max(0, pageWidth - marginLeft - marginRight);

  return (
    <div
      aria-hidden="true"
      className="border-border bg-surface text-muted-foreground relative mx-auto hidden h-6 border-y font-mono text-[10px] select-none md:block"
      style={{ width: `${pageWidth}px` }}
    >
      {/* Left Shaded Margin Zone */}
      <div
        className="bg-surface-secondary/70 absolute top-0 bottom-0 left-0 border-r border-slate-300/60 dark:border-slate-700/60"
        style={{ width: `${marginLeft}px` }}
      />

      {/* Active Content Zone */}
      <div
        className="bg-surface absolute top-0 bottom-0"
        style={{ left: `${marginLeft}px`, width: `${activeWidth}px` }}
      />

      {/* Right Shaded Margin Zone */}
      <div
        className="bg-surface-secondary/70 absolute top-0 right-0 bottom-0 border-l border-slate-300/60 dark:border-slate-700/60"
        style={{ width: `${marginRight}px` }}
      />

      {/* Ticks and Number Labels */}
      <div className="pointer-events-none relative size-full">
        {ticks.map((tick) => (
          <div
            key={tick.index}
            className="absolute bottom-0 flex flex-col items-center"
            style={{ left: `${tick.position}px` }}
          >
            {tick.isInch &&
              tick.inchNumber !== null &&
              tick.inchNumber > 0 &&
              tick.inchNumber < totalInches && (
                <span className="text-muted absolute -top-3.5 -translate-x-1/2 text-[9px] leading-none font-medium">
                  {tick.inchNumber}
                </span>
              )}
            <span className={`w-px bg-slate-400 dark:bg-slate-500 ${tick.height}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentRuler;
