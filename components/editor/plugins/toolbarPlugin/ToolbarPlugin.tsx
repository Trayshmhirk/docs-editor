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
  Italic,
  Link,
  RotateCcw,
  RotateCw,
  Table as TableIcon,
  Underline,
} from "lucide-react";
import { INSERT_TABLE_COMMAND } from "@lexical/table";
import { Button } from "@/components/ui/button";
import BlockFormatDropDown from "./toolbarDropdown/BlockFormatDropdown";
import { blockTypeToBlockName, useToolbarState } from "@/context/ToolbarContext";
import { CODE_LANGUAGE_OPTIONS, dropDownActiveClass, getSelectedNode } from "./utils";
import DropDown, { DropDownItem } from "@/components/ui/lexical/dropdown";
import { FontDropDown } from "./toolbarDropdown/FontDropdown";
import { $getSelectionStyleValueForProperty } from "@lexical/selection";
import { ElementFormatDropdown } from "./toolbarDropdown/ElementFormatDropdown";
import { sanitizeUrl } from "@/lib/utils";
import FontSize from "./fontSize";

// Section 2.3 Expanded Formatting Components
import FontColorButton from "./FontColorButton";
import HighlightColorButton from "./HighlightColorButton";
import LineSpacingDropdown from "./LineSpacingDropdown";
import {
  BulletedListDropdown,
  NumberedListDropdown,
  ChecklistButton,
  IndentControls,
} from "./ListDropdowns";
import FormatDropdown from "./FormatDropdown";
import ClearFormattingButton from "./ClearFormattingButton";
import PageLayoutDropdown from "./PageLayoutDropdown";

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
      className="toolbar flex h-full scrollbar-none items-center gap-1 overflow-x-auto bg-transparent p-0.5"
      ref={toolbarRef}
    >
      {/* 1. History Controls */}
      <button
        disabled={!canUndo || !isEditable}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        onMouseDown={(e) => e.preventDefault()}
        className="toolbar-item toolbar-button"
        aria-label="Undo"
        title="Undo (Ctrl+Z)"
      >
        <RotateCcw className="format icon size-4" />
      </button>

      <button
        disabled={!canRedo || !isEditable}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        onMouseDown={(e) => e.preventDefault()}
        className="toolbar-item toolbar-button"
        aria-label="Redo"
        title="Redo (Ctrl+Y)"
      >
        <RotateCw className="format icon size-4" />
      </button>

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
        <DropDown
          disabled={!isEditable}
          buttonClassName="toolbar-item code-language"
          buttonLabel={getLanguageFriendlyName(toolbarState.codeLanguage)}
          buttonAriaLabel="Select language"
        >
          {CODE_LANGUAGE_OPTIONS.map(([value, name]) => (
            <DropDownItem
              className={`item hover:enabled:bg-surface-hover text-foreground flex min-w-25 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${dropDownActiveClass(
                value === toolbarState.codeLanguage,
              )}`}
              onClick={() => onCodeLanguageSelect(value)}
              key={value}
            >
              <span className="text">{name}</span>
            </DropDownItem>
          ))}
        </DropDown>
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
          <Button
            variant="ghost"
            size="icon"
            disabled={!isEditable}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            className={`toolbar-item toolbar-button size-8 ${toolbarState.isBold ? "active" : ""}`}
            aria-label="Format Bold"
            title="Bold (Ctrl+B)"
          >
            <Bold className="format icon size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={!isEditable}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            className={`toolbar-item toolbar-button size-8 ${
              toolbarState.isItalic ? "active" : ""
            }`}
            aria-label="Format Italics"
            title="Italic (Ctrl+I)"
          >
            <Italic className="format icon size-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={!isEditable}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            className={`toolbar-item toolbar-button size-8 ${
              toolbarState.isUnderline ? "active" : ""
            }`}
            aria-label="Format Underline"
            title="Underline (Ctrl+U)"
          >
            <Underline className="format icon size-4" />
          </Button>

          {/* Text & Highlight Color Pickers */}
          <FontColorButton disabled={!isEditable} />
          <HighlightColorButton disabled={!isEditable} />

          <Divider />

          {/* Link & Table */}
          <Button
            variant="ghost"
            size="icon"
            disabled={!isEditable}
            onClick={insertLink}
            className={`toolbar-item toolbar-button size-8 ${toolbarState.isLink ? "active" : ""}`}
            aria-label="Insert link"
            title="Insert Link (Ctrl+K)"
            type="button"
          >
            <Link className="format icon size-4 rotate-45 transform" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            disabled={!isEditable}
            onClick={insertTable}
            className="toolbar-item toolbar-button size-8"
            aria-label="Insert table"
            type="button"
            title="Insert Table"
          >
            <TableIcon className="format icon size-4" />
          </Button>

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
