"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type PageSizePreset = "letter" | "a4" | "legal" | "pageless";
export type MarginPreset = "normal" | "narrow" | "moderate" | "wide";

export interface PageLayoutConfig {
  pageSize: PageSizePreset;
  margins: MarginPreset;
  width: number; // in pixels
  minHeight: number; // in pixels
  paddingX: number; // in pixels
  paddingY: number; // in pixels
  isPageless: boolean;
}

export const PAGE_SIZE_SPECS: Record<
  PageSizePreset,
  { label: string; width: number; height: number; isPageless: boolean }
> = {
  letter: { label: "Letter (8.5 x 11″)", width: 816, height: 1056, isPageless: false },
  a4: { label: "A4 (8.27 x 11.69″)", width: 794, height: 1123, isPageless: false },
  legal: { label: "Legal (8.5 x 14″)", width: 816, height: 1344, isPageless: false },
  pageless: { label: "Pageless (Fluid)", width: 960, height: 1056, isPageless: true },
};

export const MARGIN_SPECS: Record<
  MarginPreset,
  { label: string; padX: number; padY: number; preview: string }
> = {
  normal: { label: "Normal (1″)", padX: 96, padY: 96, preview: "1.00″" },
  narrow: { label: "Narrow (0.5″)", padX: 48, padY: 48, preview: "0.50″" },
  moderate: { label: "Moderate (0.75″)", padX: 72, padY: 72, preview: "0.75″" },
  wide: { label: "Wide (1.5″)", padX: 144, padY: 96, preview: "1.50″" },
};

interface DocumentLayoutContextValue {
  layout: PageLayoutConfig;
  setPageSize: (size: PageSizePreset) => void;
  setMargins: (margin: MarginPreset) => void;
}

const DocumentLayoutContext = createContext<DocumentLayoutContextValue | undefined>(undefined);

export function DocumentLayoutProvider({
  children,
  initialPageSize = "letter",
  initialMargins = "normal",
}: {
  children: React.ReactNode;
  initialPageSize?: PageSizePreset;
  initialMargins?: MarginPreset;
}): React.JSX.Element {
  const [pageSize, setPageSize] = useState<PageSizePreset>(initialPageSize);
  const [margins, setMargins] = useState<MarginPreset>(initialMargins);

  const layout = useMemo<PageLayoutConfig>(() => {
    const sizeSpec = PAGE_SIZE_SPECS[pageSize];
    const marginSpec = MARGIN_SPECS[margins];

    return {
      pageSize,
      margins,
      width: sizeSpec.width,
      minHeight: sizeSpec.height,
      paddingX: sizeSpec.isPageless ? 48 : marginSpec.padX,
      paddingY: sizeSpec.isPageless ? 32 : marginSpec.padY,
      isPageless: sizeSpec.isPageless,
    };
  }, [pageSize, margins]);

  // Keep CSS Variables on :root synchronized
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--page-width",
        layout.isPageless ? "100%" : `${layout.width}px`,
      );
      document.documentElement.style.setProperty(
        "--page-height",
        layout.isPageless ? "auto" : `${layout.minHeight}px`,
      );
      document.documentElement.style.setProperty("--page-padding-x", `${layout.paddingX}px`);
      document.documentElement.style.setProperty("--page-padding-y", `${layout.paddingY}px`);
    }
  }, [layout]);

  return (
    <DocumentLayoutContext.Provider value={{ layout, setPageSize, setMargins }}>
      {children}
    </DocumentLayoutContext.Provider>
  );
}

export function useDocumentLayout(): DocumentLayoutContextValue {
  const context = useContext(DocumentLayoutContext);
  if (!context) {
    throw new Error("useDocumentLayout must be used within a DocumentLayoutProvider");
  }
  return context;
}
