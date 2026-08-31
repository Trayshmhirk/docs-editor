"use client";

import React, { useRef, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $patchStyleText } from "@lexical/selection";
import { $getSelection, $isRangeSelection } from "lexical";
import { Highlighter } from "lucide-react";
import { useToolbarState } from "@/context/ToolbarContext";
import CustomToolbarButton from "@/components/ui/custom/CustomToolbarButton";
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

  const activeColor =
    toolbarState.bgColor &&
    toolbarState.bgColor !== "#fff" &&
    toolbarState.bgColor !== "transparent"
      ? toolbarState.bgColor
      : "";

  const handleSelectColor = (color: string | null) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (!color) {
          $patchStyleText(selection, { "background-color": null });
        } else {
          $patchStyleText(selection, { "background-color": color });
        }
      }
    });
    setIsOpen(false);
  };

  return (
    <>
      <CustomToolbarButton
        ref={buttonRef}
        disabled={disabled}
        isActive={isOpen}
        tooltip="Highlight color"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex-col gap-0.5"
      >
        <Highlighter className="format icon" />
        <span
          className="h-1 w-4.5 rounded-full border border-black/10"
          style={{
            backgroundColor: activeColor || "transparent",
            backgroundImage: activeColor
              ? "none"
              : "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
            backgroundSize: "4px 4px",
          }}
        />
      </CustomToolbarButton>

      <ToolbarPopover isOpen={isOpen} onClose={() => setIsOpen(false)} anchorRef={buttonRef}>
        <ColorDropdown
          currentColor={activeColor}
          onSelectColor={handleSelectColor}
          onClose={() => setIsOpen(false)}
          showNoneOption
        />
      </ToolbarPopover>
    </>
  );
}
