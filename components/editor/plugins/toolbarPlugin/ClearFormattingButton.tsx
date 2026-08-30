"use client";

import React from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getSelection, $isRangeSelection, $isTextNode } from "lexical";
import { $setBlocksType } from "@lexical/selection";
import { RemoveFormatting } from "lucide-react";

export default function ClearFormattingButton({
  disabled = false,
}: {
  disabled?: boolean;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();

  const handleClearFormatting = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // 1. Reset all selected text node formats and inline CSS styles
        const nodes = selection.getNodes();
        nodes.forEach((node) => {
          if ($isTextNode(node)) {
            node.setFormat(0);
            node.setStyle("");
          }
        });

        // 2. Convert block formats (e.g. Heading, Quote) back to normal Paragraph
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  return (
    <button
      type="button"
      disabled={disabled}
      title="Clear formatting (Ctrl+\)"
      aria-label="Clear formatting"
      onClick={handleClearFormatting}
      onMouseDown={(e) => e.preventDefault()}
      className="toolbar-item toolbar-button size-8"
    >
      <RemoveFormatting className="format icon size-4" />
    </button>
  );
}
