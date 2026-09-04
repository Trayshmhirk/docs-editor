"use client";

import React, { useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import { $createCodeNode } from "@lexical/code";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { TableGridPicker } from "@/components/editor/plugins/toolbarPlugin/dropdowns/TableGridPicker";
import { INSERT_PAGE_BREAK_COMMAND } from "@/components/editor/nodes/PageBreakNode";
import {
  CustomDropdown,
  CustomDropdownTrigger,
  CustomDropdownContent,
  CustomDropdownItem,
  CustomDropdownSub,
  CustomDropdownSubTrigger,
  CustomDropdownSubContent,
  CustomDropdownSeparator,
} from "@/components/ui/custom/CustomDropdown";
import {
  Table as TableIcon,
  Minus,
  FileCode,
  FileSpreadsheet,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface InsertMenuProps {
  disabled?: boolean;
}

export const InsertMenu: React.FC<InsertMenuProps> = ({ disabled }) => {
  const [editor] = useLexicalComposerContext();
  const [open, setOpen] = useState(false);

  const insertHorizontalRule = () => {
    editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined);
    setOpen(false);
  };

  const insertPageBreak = () => {
    editor.dispatchCommand(INSERT_PAGE_BREAK_COMMAND, undefined);
    setOpen(false);
  };

  const insertCodeBlock = () => {
    editor.update(() => {
      const codeNode = $createCodeNode();
      $insertNodeToNearestRoot(codeNode);
    });
    setOpen(false);
  };

  return (
    <CustomDropdown open={open} onOpenChange={setOpen}>
      <CustomDropdownTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          className="text-foreground/80 hover:text-foreground hover:bg-surface-secondary/80 data-[state=open]:bg-surface-secondary/80 h-7 rounded px-2.5 text-sm font-normal transition-colors outline-none select-none disabled:opacity-50"
        >
          Insert
        </Button>
      </CustomDropdownTrigger>

      <CustomDropdownContent className="w-64 p-1.5" align="start">
        {/* Table Submenu with Interactive Grid Picker */}
        <CustomDropdownSub>
          <CustomDropdownSubTrigger className="px-3 py-2 text-sm">
            <div className="flex items-center gap-3">
              <TableIcon className="size-4 text-blue-500" />
              <span>Table</span>
            </div>
          </CustomDropdownSubTrigger>
          <CustomDropdownSubContent className="w-auto p-1.5">
            <TableGridPicker onClose={() => setOpen(false)} />
          </CustomDropdownSubContent>
        </CustomDropdownSub>

        {/* Media / Image */}
        <CustomDropdownItem
          className="px-3 py-2 text-sm"
          onClick={() => {
            // Placeholder trigger for upcoming ImageNode modal
            setOpen(false);
          }}
        >
          <div className="flex items-center gap-3">
            <ImageIcon className="size-4 text-emerald-500" />
            <span>Image</span>
          </div>
        </CustomDropdownItem>

        <CustomDropdownSeparator />

        {/* Horizontal Line / Divider */}
        <CustomDropdownItem className="px-3 py-2 text-sm" onClick={insertHorizontalRule}>
          <div className="flex items-center gap-3">
            <Minus className="text-muted-foreground size-4" />
            <span>Horizontal line</span>
          </div>
        </CustomDropdownItem>

        {/* Page Break */}
        <CustomDropdownItem className="px-3 py-2 text-sm" onClick={insertPageBreak}>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="size-4 text-amber-500" />
            <span>Page break</span>
          </div>
        </CustomDropdownItem>

        <CustomDropdownSeparator />

        {/* Code Block */}
        <CustomDropdownItem className="px-3 py-2 text-sm" onClick={insertCodeBlock}>
          <div className="flex items-center gap-3">
            <FileCode className="size-4 text-indigo-500" />
            <span>Code block</span>
          </div>
        </CustomDropdownItem>
      </CustomDropdownContent>
    </CustomDropdown>
  );
};
