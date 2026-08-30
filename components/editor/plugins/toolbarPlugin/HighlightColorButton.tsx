"use client";

import React, { useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $patchStyleText } from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";
import { Highlighter } from "lucide-react";
import { useToolbarState } from "@/context/ToolbarContext";
import ColorDropdown from "./ColorDropdown";
import ToolbarPopover from "./ToolbarPopover";

export default function HighlightColorButton({
  disabled = false,
}: {
  disabled?: boolean;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const { toolbarState } = useToolbarState();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const activeBgColor =
    toolbarState.bgColor &&
    toolbarState.bgColor !== "#fff" &&
    toolbarState.bgColor !== "transparent"
      ? toolbarState.bgColor
      : "";

  const handleSelectColor = (color: string | null) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $patchStyleText(selection, { "background-color": color });
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
        title="Highlight color"
        aria-label="Highlight color"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseDown={(e) => e.preventDefault()}
        className={`toolbar-item toolbar-button relative flex size-8 flex-col items-center justify-center ${
          isOpen ? "active" : ""
        }`}
      >
        <Highlighter className="format icon size-3.5" />
        <span
          className="mt-0.5 h-1 w-4.5 rounded-full border border-black/10"
          style={{
            backgroundColor: activeBgColor || "transparent",
            backgroundImage: !activeBgColor
              ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
              : undefined,
            backgroundSize: "4px 4px",
          }}
        />
      </button>

      <ToolbarPopover isOpen={isOpen} onClose={() => setIsOpen(false)} anchorRef={buttonRef}>
        <ColorDropdown
          currentColor={activeBgColor}
          onSelectColor={handleSelectColor}
          showNoneOption={true}
          noneLabel="None"
          onClose={() => setIsOpen(false)}
        />
      </ToolbarPopover>
    </>
  );
}
