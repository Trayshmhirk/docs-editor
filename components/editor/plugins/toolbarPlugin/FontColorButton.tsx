"use client";

import React, { useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $patchStyleText } from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";
import { useToolbarState } from "@/context/ToolbarContext";
import ColorDropdown from "./ColorDropdown";
import ToolbarPopover from "./ToolbarPopover";

export default function FontColorButton({
  disabled = false,
}: {
  disabled?: boolean;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const { toolbarState } = useToolbarState();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const activeColor = toolbarState.fontColor || "#000000";

  const handleSelectColor = (color: string | null) => {
    if (!color) return;
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { color });
      }
    });
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        title="Text color"
        aria-label="Text color"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseDown={(e) => e.preventDefault()}
        className={`toolbar-item toolbar-button relative flex size-8 flex-col items-center justify-center ${
          isOpen ? "active" : ""
        }`}
      >
        <span className="font-serif text-sm leading-none font-bold">A</span>
        <span
          className="mt-0.5 h-1 w-4.5 rounded-full border border-black/10"
          style={{ backgroundColor: activeColor }}
        />
      </button>

      <ToolbarPopover isOpen={isOpen} onClose={() => setIsOpen(false)} anchorRef={buttonRef}>
        <ColorDropdown
          currentColor={activeColor}
          onSelectColor={handleSelectColor}
          onClose={() => setIsOpen(false)}
        />
      </ToolbarPopover>
    </>
  );
}
