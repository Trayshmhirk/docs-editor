"use client";

import React, { useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $insertList,
  $isListItemNode,
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from "@lexical/list";
import {
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  $getSelection,
  $isRangeSelection,
} from "lexical";
import { $getNearestNodeOfType } from "@lexical/utils";
import { List, ListOrdered, ListCheck, Indent, Outdent, ChevronDown } from "lucide-react";
import { useToolbarState } from "@/context/ToolbarContext";
import CustomToolbarButton from "@/components/ui/custom/CustomToolbarButton";
import {
  CustomPopover,
  CustomPopoverTrigger,
  CustomPopoverContent,
} from "@/components/ui/custom/CustomPopover";

// Bullet List Style Presets
const BULLET_PRESETS = [
  { label: "Default (Disc)", styleType: "disc", icon: "●" },
  { label: "Circle", styleType: "circle", icon: "○" },
  { label: "Square", styleType: "square", icon: "■" },
];

// Numbered List Style Presets
const NUMBERED_PRESETS = [
  { label: "Numbers (1, 2, 3)", styleType: "decimal", preview: "1. 2. 3." },
  { label: "Letters (a, b, c)", styleType: "lower-alpha", preview: "a. b. c." },
  { label: "Capital Letters (A, B, C)", styleType: "upper-alpha", preview: "A. B. C." },
  { label: "Roman (i, ii, iii)", styleType: "lower-roman", preview: "i. ii. iii." },
];

// Helper to recursively apply list-style-type to all ListItemNode children
function applyListStyleToItems(listNode: ListNode, styleType: string) {
  listNode.setStyle(`list-style-type: ${styleType};`);
  listNode.getChildren().forEach((child) => {
    if ($isListItemNode(child)) {
      child.setStyle(`list-style-type: ${styleType};`);
      child.getChildren().forEach((grandChild) => {
        if ($isListNode(grandChild)) {
          applyListStyleToItems(grandChild, styleType);
        }
      });
    }
  });
}

export function BulletedListDropdown({
  disabled = false,
}: {
  disabled?: boolean;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const { toolbarState } = useToolbarState();
  const [isOpen, setIsOpen] = useState(false);

  const isBulletActive = toolbarState.blockType === "bullet";

  const handleToggleOrSetStyle = (styleType: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        let listNode = $getNearestNodeOfType(anchorNode, ListNode);

        if (!listNode || listNode.getListType() !== "bullet") {
          $insertList("bullet");
          const newSelection = $getSelection();
          if ($isRangeSelection(newSelection)) {
            listNode = $getNearestNodeOfType(newSelection.anchor.getNode(), ListNode);
          }
        }

        if (listNode) {
          applyListStyleToItems(listNode, styleType);
        }
      }
    });

    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (isBulletActive) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.update(() => {
        $insertList("bullet");
      });
    }
  };

  return (
    <div className="inline-flex items-center">
      {/* Primary Button */}
      <CustomToolbarButton
        size="split-left"
        disabled={disabled}
        isActive={isBulletActive}
        tooltip="Bulleted list"
        onClick={handleButtonClick}
      >
        <List className="format icon size-4" />
      </CustomToolbarButton>

      {/* Dropdown Chevron */}
      <CustomPopover open={isOpen} onOpenChange={setIsOpen}>
        <CustomPopoverTrigger asChild>
          <CustomToolbarButton
            size="split-right"
            disabled={disabled}
            isActive={isOpen}
            tooltip="Bullet list options"
          >
            <ChevronDown className="text-foreground size-3 shrink-0" />
          </CustomToolbarButton>
        </CustomPopoverTrigger>

        <CustomPopoverContent className="w-44 p-1.5" sideOffset={8}>
          <div className="flex flex-col gap-0.5">
            {BULLET_PRESETS.map((preset) => (
              <button
                key={preset.styleType}
                type="button"
                onClick={() => handleToggleOrSetStyle(preset.styleType)}
                className="hover:bg-surface-hover text-foreground flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="font-mono text-sm leading-none">{preset.icon}</span>
                  <span>{preset.label}</span>
                </span>
              </button>
            ))}
          </div>
        </CustomPopoverContent>
      </CustomPopover>
    </div>
  );
}

export function NumberedListDropdown({
  disabled = false,
}: {
  disabled?: boolean;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const { toolbarState } = useToolbarState();
  const [isOpen, setIsOpen] = useState(false);

  const isNumberActive = toolbarState.blockType === "number";

  const handleToggleOrSetStyle = (styleType: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        let listNode = $getNearestNodeOfType(anchorNode, ListNode);

        if (!listNode || listNode.getListType() !== "number") {
          $insertList("number");
          const newSelection = $getSelection();
          if ($isRangeSelection(newSelection)) {
            listNode = $getNearestNodeOfType(newSelection.anchor.getNode(), ListNode);
          }
        }

        if (listNode) {
          applyListStyleToItems(listNode, styleType);
        }
      }
    });

    setIsOpen(false);
  };

  const handleButtonClick = () => {
    if (isNumberActive) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.update(() => {
        $insertList("number");
      });
    }
  };

  return (
    <div className="inline-flex items-center">
      {/* Primary Button */}
      <CustomToolbarButton
        size="split-left"
        disabled={disabled}
        isActive={isNumberActive}
        tooltip="Numbered list"
        onClick={handleButtonClick}
      >
        <ListOrdered className="format icon size-4" />
      </CustomToolbarButton>

      {/* Dropdown Chevron */}
      <CustomPopover open={isOpen} onOpenChange={setIsOpen}>
        <CustomPopoverTrigger asChild>
          <CustomToolbarButton
            size="split-right"
            disabled={disabled}
            isActive={isOpen}
            tooltip="Numbered list options"
          >
            <ChevronDown className="text-foreground size-3 shrink-0" />
          </CustomToolbarButton>
        </CustomPopoverTrigger>

        <CustomPopoverContent className="w-52 p-1.5" sideOffset={8}>
          <div className="flex flex-col gap-0.5">
            {NUMBERED_PRESETS.map((preset) => (
              <button
                key={preset.styleType}
                type="button"
                onClick={() => handleToggleOrSetStyle(preset.styleType)}
                className="hover:bg-surface-hover text-foreground flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition-colors"
              >
                <span>{preset.label}</span>
                <span className="text-muted-foreground font-mono text-[11px]">
                  {preset.preview}
                </span>
              </button>
            ))}
          </div>
        </CustomPopoverContent>
      </CustomPopover>
    </div>
  );
}

export function ChecklistButton({ disabled = false }: { disabled?: boolean }): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const { toolbarState } = useToolbarState();

  const isCheckActive = toolbarState.blockType === "check";

  const handleToggle = () => {
    if (isCheckActive) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    }
  };

  return (
    <CustomToolbarButton
      disabled={disabled}
      isActive={isCheckActive}
      tooltip="Checklist"
      onClick={handleToggle}
    >
      <ListCheck className="format icon size-4" />
    </CustomToolbarButton>
  );
}

export function IndentControls({ disabled = false }: { disabled?: boolean }): React.JSX.Element {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="inline-flex items-center gap-0.5">
      <CustomToolbarButton
        disabled={disabled}
        tooltip="Decrease indent (Outdent)"
        onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
      >
        <Outdent className="format icon size-4" />
      </CustomToolbarButton>

      <CustomToolbarButton
        disabled={disabled}
        tooltip="Increase indent (Indent)"
        onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
      >
        <Indent className="format icon size-4" />
      </CustomToolbarButton>
    </div>
  );
}
