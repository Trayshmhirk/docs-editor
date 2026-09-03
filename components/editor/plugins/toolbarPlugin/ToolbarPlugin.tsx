"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { $isListNode, ListNode } from "@lexical/list";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isCodeNode, CODE_LANGUAGE_MAP, getLanguageFriendlyName } from "@lexical/code";
import {
  $isRootOrShadowRoot,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  NodeKey,
  $getNodeByKey,
  $isElementNode,
} from "lexical";
import { $isHeadingNode } from "@lexical/rich-text";
import { $findMatchingParent } from "@lexical/utils";
import React, { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
  Italic,
  Link,
  Printer,
  RotateCcw,
  RotateCw,
  Table as TableIcon,
  Underline,
} from "lucide-react";
import CustomToolbarButton from "@/components/ui/custom/CustomToolbarButton";
import {
  CustomDropdown,
  CustomDropdownTrigger,
  CustomDropdownContent,
  CustomDropdownItem,
} from "@/components/ui/custom/CustomDropdown";
import BlockFormatDropDown from "./dropdowns/BlockFormatDropdown";
import { blockTypeToBlockName, useToolbarState } from "@/context/ToolbarContext";
import { CODE_LANGUAGE_OPTIONS, getSelectedNode } from "./utils";
import { FontDropDown } from "./dropdowns/FontDropdown";
import { $getSelectionStyleValueForProperty } from "@lexical/selection";
import { ElementFormatDropdown } from "./dropdowns/ElementFormatDropdown";
import { sanitizeUrl } from "@/lib/utils";
import FontSize from "./dropdowns/fontSize";
import ZoomDropdown from "./dropdowns/ZoomDropdown";

// Section 2.3 Expanded Formatting Components
import FontColorButton from "./dropdowns/FontColorButton";
import HighlightColorButton from "./dropdowns/HighlightColorButton";
import MoreOptionsDropdown from "./dropdowns/MoreOptionsDropdown";
import LineSpacingDropdown from "./dropdowns/LineSpacingDropdown";
import {
  BulletedListDropdown,
  NumberedListDropdown,
  ChecklistButton,
  IndentControls,
} from "./dropdowns/ListDropdowns";
import FormatDropdown from "./dropdowns/FormatDropdown";
import ClearFormattingButton from "./dropdowns/ClearFormattingButton";
import PageLayoutDropdown from "./dropdowns/PageLayoutDropdown";
import {
  CustomPopover,
  CustomPopoverTrigger,
  CustomPopoverContent,
} from "@/components/ui/custom/CustomPopover";
import { TableGridPicker } from "./dropdowns/TableGridPicker";

const LowPriority = 1;

function Divider() {
  return <div className="bg-border mx-1 h-5 w-px shrink-0 self-center" />;
}

export default function ToolbarPlugin({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: Dispatch<boolean>;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();

  const toolbarRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1400);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);

  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);

  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const { toolbarState, updateToolbarState } = useToolbarState();

  // Progressive container width measurement with RAF debouncing
  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    let rafId: number;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          setContainerWidth(width);
        });
      }
    });

    observer.observe(toolbar);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []);

  // Compute dynamic cutoff index based on available toolbar container width
  const cutoffIndex = useMemo<number>(() => {
    if (containerWidth >= 1200) return 10; // All 10 groups fit, More Options hidden
    if (containerWidth >= 1110) return 9; // Group 9 overflows (Clear formatting, Page setup)
    if (containerWidth >= 1030) return 8; // Group 8 & 9 overflow (Indent controls)
    if (containerWidth >= 920) return 7; // Group 7..9 overflow (Lists)
    if (containerWidth >= 810) return 6; // Group 6..9 overflow (Alignment, Spacing)
    if (containerWidth >= 720) return 5; // Group 5..9 overflow (Link, Table)
    if (containerWidth >= 590) return 4; // Group 4..9 overflow (Bold, Italic, Underline, Colors)
    if (containerWidth >= 480) return 3; // Group 3..9 overflow (Font Size)
    return 2; // Group 2..9 overflow (Font Family)
  }, [containerWidth]);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      // 1. Text Formatting Flags
      updateToolbarState("isBold", selection.hasFormat("bold"));
      updateToolbarState("isItalic", selection.hasFormat("italic"));
      updateToolbarState("isUnderline", selection.hasFormat("underline"));
      updateToolbarState("isStrikethrough", selection.hasFormat("strikethrough"));
      updateToolbarState("isSubscript", selection.hasFormat("subscript"));
      updateToolbarState("isSuperscript", selection.hasFormat("superscript"));
      updateToolbarState("isLowercase", selection.hasFormat("lowercase"));
      updateToolbarState("isUppercase", selection.hasFormat("uppercase"));
      updateToolbarState("isCapitalize", selection.hasFormat("capitalize"));
      updateToolbarState("isCode", selection.hasFormat("code"));

      // 2. Node Type & Block Formats
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);

        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const activeList = parentList || element;
          const type = activeList.getListType();
          updateToolbarState("blockType", type);
          if (type === "check") {
            const isStrike = activeList.getStyle().includes("checklist-strikethrough");
            updateToolbarState("checklistStyle", isStrike ? "strikethrough" : "standard");
          } else {
            updateToolbarState("checklistStyle", "standard");
          }
        } else {
          updateToolbarState("checklistStyle", "standard");
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            updateToolbarState("blockType", type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language = element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            updateToolbarState(
              "codeLanguage",
              language ? CODE_LANGUAGE_MAP[language] || language : "",
            );
            return;
          }
        }
      }

      // 3. Selection Alignment / Element Format
      let matchingParent;
      if ($isLinkNode(element)) {
        // If child is a link, we want to fetch the first parent of the link that is not a LinkNode
        matchingParent = $findMatchingParent(
          element,
          (parentNode) => $isElementNode(parentNode) && !$isLinkNode(parentNode),
        );
      }
      if ($isElementNode(matchingParent)) {
        updateToolbarState("elementFormat", matchingParent.getFormatType());
      } else if ($isElementNode(element)) {
        updateToolbarState("elementFormat", element.getFormatType());
      }

      // 4. Inline Typography (Font Family, Font Size, Font Color, Background Color)
      updateToolbarState(
        "fontColor",
        $getSelectionStyleValueForProperty(selection, "color", "#000000"),
      );
      updateToolbarState(
        "bgColor",
        $getSelectionStyleValueForProperty(selection, "background-color", ""),
      );
      updateToolbarState(
        "fontFamily",
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial"),
      );
      updateToolbarState(
        "fontSize",
        $getSelectionStyleValueForProperty(selection, "font-size", "15px"),
      );

      // 5. Link Status
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        updateToolbarState("isLink", true);
      } else {
        updateToolbarState("isLink", false);
      }
    }
  }, [editor, updateToolbarState]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [editor, $updateToolbar]);

  const insertLink = useCallback(() => {
    if (!toolbarState.isLink) {
      setIsLinkEditMode(true);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
    } else {
      setIsLinkEditMode(false);
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, setIsLinkEditMode, toolbarState.isLink]);

  const handlePrint = useCallback(() => {
    if (typeof window !== "undefined") {
      window.print();
    }
  }, []);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      editor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [editor, selectedElementKey],
  );

  // Group definitions for progressive ribbon rendering
  const renderGroup2 = () =>
    toolbarState.blockType === "code" ? (
      <CustomDropdown>
        <CustomDropdownTrigger asChild>
          <CustomToolbarButton
            disabled={!isEditable}
            tooltip="Code language"
            className="w-auto min-w-25 justify-between gap-1.5 px-2 font-normal"
          >
            <span className="truncate text-xs font-medium">
              {getLanguageFriendlyName(toolbarState.codeLanguage)}
            </span>
            <ChevronDown className="text-muted-foreground size-3 shrink-0" />
          </CustomToolbarButton>
        </CustomDropdownTrigger>

        <CustomDropdownContent className="w-36 p-1">
          {CODE_LANGUAGE_OPTIONS.map(([value, name]) => (
            <CustomDropdownItem
              key={value}
              isActive={value === toolbarState.codeLanguage}
              onClick={() => onCodeLanguageSelect(value)}
            >
              <span>{name}</span>
            </CustomDropdownItem>
          ))}
        </CustomDropdownContent>
      </CustomDropdown>
    ) : (
      <FontDropDown
        disabled={!isEditable}
        style={"font-family"}
        value={toolbarState.fontFamily}
        editor={editor}
      />
    );

  const renderGroup3 = () =>
    toolbarState.blockType === "code" ? null : (
      <FontSize
        selectionFontSize={toolbarState.fontSize.slice(0, -2)}
        editor={editor}
        disabled={!isEditable}
      />
    );

  const renderGroup4 = () => (
    <div className="inline-flex items-center gap-0.5">
      <CustomToolbarButton
        disabled={!isEditable}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        isActive={toolbarState.isBold}
        tooltip="Bold (Ctrl+B)"
      >
        <Bold className="format icon size-4" />
      </CustomToolbarButton>

      <CustomToolbarButton
        disabled={!isEditable}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        isActive={toolbarState.isItalic}
        tooltip="Italic (Ctrl+I)"
      >
        <Italic className="format icon size-4" />
      </CustomToolbarButton>

      <CustomToolbarButton
        disabled={!isEditable}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        isActive={toolbarState.isUnderline}
        tooltip="Underline (Ctrl+U)"
      >
        <Underline className="format icon size-4" />
      </CustomToolbarButton>

      <FontColorButton disabled={!isEditable} />
      <HighlightColorButton disabled={!isEditable} />
    </div>
  );

  const renderGroup5 = () => (
    <div className="inline-flex items-center gap-0.5">
      <CustomToolbarButton
        disabled={!isEditable}
        onClick={insertLink}
        isActive={toolbarState.isLink}
        tooltip="Insert Link (Ctrl+K)"
      >
        <Link className="format icon size-4 rotate-45 transform" />
      </CustomToolbarButton>

      <CustomPopover open={isTablePickerOpen} onOpenChange={setIsTablePickerOpen}>
        <CustomPopoverTrigger asChild>
          <CustomToolbarButton
            disabled={!isEditable}
            tooltip="Insert Table"
            isActive={isTablePickerOpen}
          >
            <TableIcon className="format icon size-4" />
          </CustomToolbarButton>
        </CustomPopoverTrigger>
        <CustomPopoverContent sideOffset={4} align="start">
          <TableGridPicker onClose={() => setIsTablePickerOpen(false)} />
        </CustomPopoverContent>
      </CustomPopover>
    </div>
  );

  const renderGroup6 = () => (
    <div className="inline-flex items-center gap-0.5">
      <ElementFormatDropdown
        disabled={!isEditable}
        value={toolbarState.elementFormat}
        editor={editor}
      />
      <LineSpacingDropdown disabled={!isEditable} />
    </div>
  );

  const renderGroup7 = () => (
    <div className="inline-flex items-center gap-0.5">
      <ChecklistButton disabled={!isEditable} />
      <BulletedListDropdown disabled={!isEditable} />
      <NumberedListDropdown disabled={!isEditable} />
    </div>
  );

  const renderGroup8 = () => <IndentControls disabled={!isEditable} />;

  const renderGroup9 = () => (
    <div className="inline-flex items-center gap-0.5">
      <ClearFormattingButton disabled={!isEditable} />
      <FormatDropdown disabled={!isEditable} />
      <PageLayoutDropdown disabled={!isEditable} />
    </div>
  );

  // Overflow elements inside the floating popup
  const renderOverflowContent = () => (
    <div className="flex items-center gap-0.5">
      {cutoffIndex <= 2 && (
        <>
          {renderGroup2()}
          <Divider />
        </>
      )}
      {cutoffIndex <= 3 && (
        <>
          {renderGroup3()}
          <Divider />
        </>
      )}
      {cutoffIndex <= 4 && (
        <>
          {renderGroup4()}
          <Divider />
        </>
      )}
      {cutoffIndex <= 5 && (
        <>
          {renderGroup5()}
          <Divider />
        </>
      )}
      {cutoffIndex <= 6 && (
        <>
          {renderGroup6()}
          <Divider />
        </>
      )}
      {cutoffIndex <= 7 && (
        <>
          {renderGroup7()}
          <Divider />
        </>
      )}
      {cutoffIndex <= 8 && (
        <>
          {renderGroup8()}
          <Divider />
        </>
      )}
      {cutoffIndex <= 9 && renderGroup9()}
    </div>
  );

  return (
    <div
      className="toolbar flex h-full scrollbar-none items-center gap-0.5 overflow-x-auto bg-transparent p-0.5"
      ref={toolbarRef}
    >
      {/* Group 0: History, Print, Zoom (Always Visible) */}
      <CustomToolbarButton
        disabled={!canUndo || !isEditable}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        tooltip="Undo (Ctrl+Z)"
      >
        <RotateCcw className="format icon size-4" />
      </CustomToolbarButton>

      <CustomToolbarButton
        disabled={!canRedo || !isEditable}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        tooltip="Redo (Ctrl+Y)"
      >
        <RotateCw className="format icon size-4" />
      </CustomToolbarButton>

      <CustomToolbarButton disabled={!isEditable} onClick={handlePrint} tooltip="Print (Ctrl+P)">
        <Printer className="format icon size-4" />
      </CustomToolbarButton>

      <Divider />

      <ZoomDropdown disabled={!isEditable} />

      <Divider />

      {/* Group 1: Text Style (Always Visible) */}
      {toolbarState.blockType in blockTypeToBlockName && editor && (
        <>
          <BlockFormatDropDown
            disabled={!isEditable}
            blockType={toolbarState.blockType}
            rootType={toolbarState.rootType}
            editor={editor}
          />
          <Divider />
        </>
      )}

      {/* Group 2: Font Family */}
      {cutoffIndex > 2 && (
        <>
          {renderGroup2()}
          <Divider />
        </>
      )}

      {/* Group 3: Font Size */}
      {cutoffIndex > 3 && (
        <>
          {renderGroup3()}
          <Divider />
        </>
      )}

      {/* Group 4: Inline Formatting */}
      {cutoffIndex > 4 && (
        <>
          {renderGroup4()}
          <Divider />
        </>
      )}

      {/* Group 5: Link & Table */}
      {cutoffIndex > 5 && (
        <>
          {renderGroup5()}
          <Divider />
        </>
      )}

      {/* Group 6: Align & Spacing */}
      {cutoffIndex > 6 && (
        <>
          {renderGroup6()}
          <Divider />
        </>
      )}

      {/* Group 7: Lists */}
      {cutoffIndex > 7 && (
        <>
          {renderGroup7()}
          <Divider />
        </>
      )}

      {/* Group 8: Indent & Outdent */}
      {cutoffIndex > 8 && (
        <>
          {renderGroup8()}
          <Divider />
        </>
      )}

      {/* Group 9: Clear Formatting & Page Setup */}
      {cutoffIndex > 9 && renderGroup9()}

      {/* Dynamic More Options Button (Appears only when items have overflowed) */}
      {cutoffIndex < 10 && (
        <MoreOptionsDropdown disabled={!isEditable}>{renderOverflowContent()}</MoreOptionsDropdown>
      )}
    </div>
  );
}
