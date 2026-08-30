"use client";

import React, { useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isElementNode, $isRangeSelection, ElementNode } from "lexical";
import { BetweenVerticalStart, Check } from "lucide-react";
import ToolbarPopover from "./ToolbarPopover";

// Helper to patch CSS style string
function patchElementStyle(currentStyle: string, updates: Record<string, string | null>): string {
  const stylesObj: Record<string, string> = {};
  currentStyle.split(";").forEach((pair) => {
    const colonIdx = pair.indexOf(":");
    if (colonIdx !== -1) {
      const key = pair.slice(0, colonIdx).trim();
      const val = pair.slice(colonIdx + 1).trim();
      if (key && val) {
        stylesObj[key] = val;
      }
    }
  });

  Object.entries(updates).forEach(([key, val]) => {
    if (val === null || val === "") {
      delete stylesObj[key];
    } else {
      stylesObj[key] = val;
    }
  });

  return Object.entries(stylesObj)
    .map(([k, v]) => `${k}: ${v}`)
    .join("; ");
}

const LINE_SPACING_OPTIONS = [
  { label: "Single", value: "1" },
  { label: "1.15", value: "1.15" },
  { label: "1.5", value: "1.5" },
  { label: "Double", value: "2" },
];

export default function LineSpacingDropdown({
  disabled = false,
}: {
  disabled?: boolean;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [currentLineHeight, setCurrentLineHeight] = useState<string>("1.15");
  const [hasSpaceBefore, setHasSpaceBefore] = useState(false);
  const [hasSpaceAfter, setHasSpaceAfter] = useState(false);

  const applyLineSpacing = (spacing: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        const elementNodes = new Set<ElementNode>();

        for (const node of nodes) {
          const topElement = node.getTopLevelElement();
          if (topElement && $isElementNode(topElement)) {
            elementNodes.add(topElement);
          }
        }

        elementNodes.forEach((el) => {
          const current = el.getStyle();
          el.setStyle(patchElementStyle(current, { "line-height": spacing }));
        });
      }
    });
    setCurrentLineHeight(spacing);
    setIsOpen(false);
  };

  const toggleSpaceBefore = () => {
    const newValue = !hasSpaceBefore;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        const elementNodes = new Set<ElementNode>();

        for (const node of nodes) {
          const topElement = node.getTopLevelElement();
          if (topElement && $isElementNode(topElement)) {
            elementNodes.add(topElement);
          }
        }

        elementNodes.forEach((el) => {
          const current = el.getStyle();
          el.setStyle(patchElementStyle(current, { "margin-top": newValue ? "14px" : null }));
        });
      }
    });
    setHasSpaceBefore(newValue);
    setIsOpen(false);
  };

  const toggleSpaceAfter = () => {
    const newValue = !hasSpaceAfter;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const nodes = selection.getNodes();
        const elementNodes = new Set<ElementNode>();

        for (const node of nodes) {
          const topElement = node.getTopLevelElement();
          if (topElement && $isElementNode(topElement)) {
            elementNodes.add(topElement);
          }
        }

        elementNodes.forEach((el) => {
          const current = el.getStyle();
          el.setStyle(patchElementStyle(current, { "margin-bottom": newValue ? "14px" : null }));
        });
      }
    });
    setHasSpaceAfter(newValue);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        title="Line & paragraph spacing"
        aria-label="Line & paragraph spacing"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseDown={(e) => e.preventDefault()}
        className={`toolbar-item toolbar-button size-8 ${isOpen ? "active" : ""}`}
      >
        <BetweenVerticalStart className="format icon size-4" />
      </button>

      <ToolbarPopover isOpen={isOpen} onClose={() => setIsOpen(false)} anchorRef={buttonRef}>
        <div className="border-border bg-surface text-foreground w-52 rounded-lg border p-1.5 shadow-xl select-none">
          {/* Line Height Options */}
          <div className="flex flex-col gap-0.5">
            {LINE_SPACING_OPTIONS.map((opt) => {
              const isSelected = currentLineHeight === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => applyLineSpacing(opt.value)}
                  className="hover:bg-surface-hover text-foreground flex items-center justify-between rounded-md px-3 py-1.5 text-left text-xs transition-colors"
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} className="text-primary dark:text-accent" />}
                </button>
              );
            })}
          </div>

          <div className="border-border my-1.5 border-t" />

          {/* Paragraph Spacing Toggles */}
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              onClick={toggleSpaceBefore}
              className="hover:bg-surface-hover text-foreground flex items-center justify-between rounded-md px-3 py-1.5 text-left text-xs transition-colors"
            >
              <span>
                {hasSpaceBefore ? "Remove space before paragraph" : "Add space before paragraph"}
              </span>
            </button>
            <button
              type="button"
              onClick={toggleSpaceAfter}
              className="hover:bg-surface-hover text-foreground flex items-center justify-between rounded-md px-3 py-1.5 text-left text-xs transition-colors"
            >
              <span>
                {hasSpaceAfter ? "Remove space after paragraph" : "Add space after paragraph"}
              </span>
            </button>
          </div>
        </div>
      </ToolbarPopover>
    </>
  );
}
