import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import { $isListNode, ListNode } from "@lexical/list";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isCodeNode,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from "@lexical/code";
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
  $isTextNode,
} from "lexical";
import { $isHeadingNode } from "@lexical/rich-text";
import { $findMatchingParent } from "@lexical/utils";
import React, { Dispatch } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold,
  Italic,
  Link,
  RotateCcw,
  RotateCw,
  Underline,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BlockFormatDropDown from "./toolbarDropdown/BlockFormatDropdown";
import {
  blockTypeToBlockName,
  useToolbarState,
} from "@/context/ToolbarContext";
import {
  CODE_LANGUAGE_OPTIONS,
  dropDownActiveClass,
  getSelectedNode,
} from "./utils";
import DropDown, { DropDownItem } from "@/components/ui/lexical/dropdown";
import { FontDropDown } from "./toolbarDropdown/FontDropdown";
import { $getSelectionStyleValueForProperty } from "@lexical/selection";
import { ElementFormatDropdown } from "./toolbarDropdown/ElementFormatDropdown";
import TextFormatDropdown, {
  TEXT_TRANSFORM_COMMAND,
} from "./toolbarDropdown/TextFormatDropdown";
import { sanitizeUrl } from "@/lib/utils";

const LowPriority = 1;

function Divider() {
  return <div className="w-[1px] h-full bg-[#dedede] dark:bg-[#3b3b3b] mx-1" />;
}

export default function ToolbarPlugin({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();

  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  );

  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const { toolbarState, updateToolbarState } = useToolbarState();

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      // Update text format
      updateToolbarState("isBold", selection.hasFormat("bold"));
      updateToolbarState("isItalic", selection.hasFormat("italic"));
      updateToolbarState("isUnderline", selection.hasFormat("underline"));
      updateToolbarState(
        "isStrikethrough",
        selection.hasFormat("strikethrough")
      );
      updateToolbarState("isSubscript", selection.hasFormat("subscript"));
      updateToolbarState("isSuperscript", selection.hasFormat("superscript"));

      ///// -------
      const anchorNode = selection.anchor.getNode();

      if ($isTextNode(anchorNode)) {
        const textContent = anchorNode.getTextContent();
        const isLowercase = textContent === textContent.toLowerCase();
        const isUppercase = textContent === textContent.toUpperCase();
        const isCapitalize =
          textContent ===
          textContent.replace(/\b\w/g, (char) => char.toUpperCase());

        updateToolbarState("isLowercase", isLowercase);
        updateToolbarState("isUppercase", isUppercase);
        updateToolbarState("isCapitalize", isCapitalize && !isUppercase);
      }

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

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();

          updateToolbarState("blockType", type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            updateToolbarState(
              "blockType",
              type as keyof typeof blockTypeToBlockName
            );
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            updateToolbarState(
              "codeLanguage",
              language ? CODE_LANGUAGE_MAP[language] || language : ""
            );
            return;
          }
        }
      }

      updateToolbarState(
        "fontFamily",
        $getSelectionStyleValueForProperty(selection, "font-family", "Arial")
      );

      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }

      // If matchingParent is a valid node, pass it's format type
      updateToolbarState(
        "elementFormat",
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || "left"
      );
    }
  }, [updateToolbarState, editor]);

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
        (/*_payload, _newEditor*/) => {
          $updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        TEXT_TRANSFORM_COMMAND,
        (transform: "lowercase" | "uppercase" | "capitalize") => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            selection.getNodes().forEach((node) => {
              if ($isTextNode(node)) {
                const textContent = node.getTextContent();
                let transformedText = textContent;
                if (transform === "lowercase") {
                  transformedText = textContent.toLowerCase();
                } else if (transform === "uppercase") {
                  transformedText = textContent.toUpperCase();
                } else if (transform === "capitalize") {
                  // Ensure proper capitalization even if the text is fully uppercase
                  transformedText = textContent
                    .toLowerCase() // Start by converting the whole text to lowercase
                    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize the first letter of each word
                }
                node.setTextContent(transformedText);
              }
            });
          }
          return true;
        },
        LowPriority
      )
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
    [editor, selectedElementKey]
  );

  console.log(toolbarState.isLink);

  return (
    <div
      className="toolbar h-full flex gap-[2px] bg-[#fcfcfc] dark:bg-[#1e1e1e] p-1 rounded-t-lg"
      ref={toolbarRef}
    >
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item toolbar-button"
        aria-label="Undo"
      >
        <RotateCcw className="format icon" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item toolbar-button"
        aria-label="Redo"
      >
        <RotateCw className="format icon" />
      </button>
      <Divider />
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
      {toolbarState.blockType === "code" ? (
        <>
          <DropDown
            disabled={!isEditable}
            buttonClassName="toolbar-item code-language"
            buttonLabel={getLanguageFriendlyName(toolbarState.codeLanguage)}
            buttonAriaLabel="Select language"
          >
            {CODE_LANGUAGE_OPTIONS.map(([value, name]) => {
              return (
                <DropDownItem
                  className={`item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b]  ${dropDownActiveClass(
                    value === toolbarState.codeLanguage
                  )}`}
                  onClick={() => onCodeLanguageSelect(value)}
                  key={value}
                >
                  <span className="text">{name}</span>
                </DropDownItem>
              );
            })}
          </DropDown>
        </>
      ) : (
        <>
          <FontDropDown
            disabled={!isEditable}
            style={"font-family"}
            value={toolbarState.fontFamily}
            editor={editor}
          />
          <Divider />
          <Button
            disabled={!isEditable}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            className={`toolbar-item toolbar-button ${toolbarState.isBold ? "active" : ""}`}
            aria-label="Format Bold"
          >
            <Bold className="format icon" />
          </Button>
          <Button
            disabled={!isEditable}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            className={`toolbar-item toolbar-button ${toolbarState.isItalic ? "active" : ""}`}
            aria-label="Format Italics"
          >
            <Italic className="format icon" />
          </Button>
          <Button
            disabled={!isEditable}
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            className={`toolbar-item toolbar-button ${toolbarState.isUnderline ? "active" : ""}`}
            aria-label="Format Underline"
          >
            <Underline className="format icon" />
          </Button>
          <Button
            disabled={!isEditable}
            onClick={insertLink}
            className={
              "toolbar-item toolbar-button spaced " +
              (toolbarState.isLink ? "active" : "")
            }
            aria-label="Insert link"
            // title={`Insert link (${SHORTCUTS.INSERT_LINK})`}
            type="button"
          >
            <Link className="format icon transform rotate-45" />
          </Button>
          <TextFormatDropdown
            editor={editor}
            disabled={!isEditable}
            toolbarState={toolbarState}
          />
        </>
      )}
      <Divider />
      <ElementFormatDropdown
        disabled={!isEditable}
        value={toolbarState.elementFormat}
        editor={editor}
      />
    </div>
  );
}
