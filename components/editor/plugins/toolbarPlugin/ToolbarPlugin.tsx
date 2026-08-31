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
import React, { Dispatch, useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
  Italic,
  Link,
  RotateCcw,
  RotateCw,
  Table as TableIcon,
  Underline,
} from "lucide-react";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
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

// Section 2.3 Expanded Formatting Components
import FontColorButton from "./dropdowns/FontColorButton";
import HighlightColorButton from "./dropdowns/HighlightColorButton";
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
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);

  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const { toolbarState, updateToolbarState } = useToolbarState();

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

      // 2. Font Styles
      updateToolbarState(
        "fontSize",
        $getSelectionStyleValueForProperty(selection, "font-size", "15px"),
      );
      updateToolbarState(
        "fontFamily",
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial"),
      );
      updateToolbarState(
        "fontColor",
        $getSelectionStyleValueForProperty(selection, "color", "#000000"),
      );
      updateToolbarState(
        "bgColor",
        $getSelectionStyleValueForProperty(selection, "background-color", "transparent"),
      );

      // 3. Block and Anchor Analysis
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

      // 4. Links and Table Root Status
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      const isLink = $isLinkNode(parent) || $isLinkNode(node);
      updateToolbarState("isLink", isLink);

      const tableNode = $findMatchingParent(node, (e) => e.getType() === "table");
      if (tableNode) {
        updateToolbarState("rootType", "table");
      } else {
        updateToolbarState("rootType", "root");
      }

      // 5. Block Type (Heading, List, Code, Paragraph)
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          updateToolbarState("blockType", type);
        } else {
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

      // 6. Element Alignment
      let matchingParent;
      if ($isLinkNode(parent)) {
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }

      updateToolbarState(
        "elementFormat",
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || "left",
      );
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
        () => {
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

  const insertTable = useCallback(() => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns: "3",
      rows: "3",
      includeHeaders: false,
    });
  }, [editor]);

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

  return (
    <div
      className="toolbar flex h-full scrollbar-none items-center gap-0.5 overflow-x-auto bg-transparent p-0.5"
      ref={toolbarRef}
    >
      {/* 1. History Controls */}
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

      <Divider />

      {/* 2. Format Options (Aa dropdown: Strikethrough, Subscript, Superscript, Title Case) */}
      <FormatDropdown disabled={!isEditable} />

      <Divider />

      {/* 3. Block Style Dropdown (Normal, Heading 1..6, Quote) */}
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

      {/* 4. Code Block Language Selector vs Typography Controls */}
      {toolbarState.blockType === "code" ? (
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
        <>
          {/* Font Family */}
          <FontDropDown
            disabled={!isEditable}
            style={"font-family"}
            value={toolbarState.fontFamily}
            editor={editor}
          />

          <Divider />

          {/* Font Size (- / + and direct input) */}
          <FontSize
            selectionFontSize={toolbarState.fontSize.slice(0, -2)}
            editor={editor}
            disabled={!isEditable}
          />

          <Divider />

          {/* Bold, Italic, Underline */}
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

          {/* Text & Highlight Color Pickers */}
          <FontColorButton disabled={!isEditable} />
          <HighlightColorButton disabled={!isEditable} />

          <Divider />

          {/* Link & Table */}
          <CustomToolbarButton
            disabled={!isEditable}
            onClick={insertLink}
            isActive={toolbarState.isLink}
            tooltip="Insert Link (Ctrl+K)"
          >
            <Link className="format icon size-4 rotate-45 transform" />
          </CustomToolbarButton>

          <CustomToolbarButton disabled={!isEditable} onClick={insertTable} tooltip="Insert Table">
            <TableIcon className="format icon size-4" />
          </CustomToolbarButton>

          <Divider />

          {/* Alignment Dropdown */}
          <ElementFormatDropdown
            disabled={!isEditable}
            value={toolbarState.elementFormat}
            editor={editor}
          />

          {/* Line & Paragraph Spacing */}
          <LineSpacingDropdown disabled={!isEditable} />

          <Divider />

          {/* Lists & Indentation Controls */}
          <ChecklistButton disabled={!isEditable} />
          <BulletedListDropdown disabled={!isEditable} />
          <NumberedListDropdown disabled={!isEditable} />
          <IndentControls disabled={!isEditable} />

          <Divider />

          {/* Clear Formatting Button */}
          <ClearFormattingButton disabled={!isEditable} />

          <Divider />

          {/* Page Layout Settings (Letter, A4, Margins) */}
          <PageLayoutDropdown disabled={!isEditable} />
        </>
      )}
    </div>
  );
}
