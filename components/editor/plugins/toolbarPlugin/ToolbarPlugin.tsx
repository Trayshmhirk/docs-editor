import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $createParagraphNode,
  $isRootOrShadowRoot,
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { $findMatchingParent } from "@lexical/utils";
import React, { Dispatch } from "react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  RotateCcw,
  RotateCw,
  Strikethrough,
  Underline,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BlockFormatDropDown from "./toolbarDropdown/BlockFormatDropdown";
import {
  blockTypeToBlockName,
  useToolbarState,
} from "@/context/ToolbarContext";

const LowPriority = 1;

function Divider() {
  return <div className="w-[1px] h-full bg-[#dedede] dark:bg-[#3b3b3b] mx-1" />;
}

export default function ToolbarPlugin(
  {
    // setIsLinkEditMode,
  }: {
    setIsLinkEditMode: Dispatch<boolean>;
  }
): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);

  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const activeBlock = useActiveBlock();

  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const { toolbarState, updateToolbarState } = useToolbarState();

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
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
      )
    );
  }, [editor, $updateToolbar]);

  function toggleBlock(type: "h1" | "h2" | "h3" | "h4" | "quote") {
    const selection = $getSelection();

    if (activeBlock === type) {
      return $setBlocksType(selection, () => $createParagraphNode());
    }

    if (type === "h1") {
      return $setBlocksType(selection, () => $createHeadingNode("h1"));
    }

    if (type === "h2") {
      return $setBlocksType(selection, () => $createHeadingNode("h2"));
    }

    if (type === "h3") {
      return $setBlocksType(selection, () => $createHeadingNode("h3"));
    }

    if (type === "h4") {
      return $setBlocksType(selection, () => $createHeadingNode("h4"));
    }

    if (type === "quote") {
      return $setBlocksType(selection, () => $createQuoteNode());
    }
  }

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
        <RotateCcw className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item toolbar-button"
        aria-label="Redo"
      >
        <RotateCw className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </button>
      <Divider />
      {toolbarState.blockType in blockTypeToBlockName &&
        activeEditor === editor && (
          <>
            <BlockFormatDropDown
              disabled={!isEditable}
              blockType={toolbarState.blockType}
              rootType={toolbarState.rootType}
              editor={activeEditor}
            />
            <Divider />
          </>
        )}
      <Button
        onClick={() => editor.update(() => toggleBlock("h1"))}
        data-active={activeBlock === "h1" ? "" : undefined}
        className={`toolbar-item toolbar-button ${activeBlock === "h1" ? "active" : ""}`}
      >
        <Heading1 className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
      <Button
        onClick={() => editor.update(() => toggleBlock("h2"))}
        data-active={activeBlock === "h2" ? "" : undefined}
        className={`toolbar-item toolbar-button ${activeBlock === "h2" ? "active" : ""}`}
      >
        <Heading2 className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
      <Button
        onClick={() => editor.update(() => toggleBlock("h3"))}
        data-active={activeBlock === "h3" ? "" : undefined}
        className={`toolbar-item toolbar-button ${activeBlock === "h3" ? "active" : ""}`}
      >
        <Heading3 className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
      <Button
        onClick={() => editor.update(() => toggleBlock("h4"))}
        data-active={activeBlock === "h4" ? "" : undefined}
        className={`toolbar-item toolbar-button ${activeBlock === "h4" ? "active" : ""}`}
      >
        <Heading4 className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
      <Divider />
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={`toolbar-item toolbar-button ${isBold ? "active" : ""}`}
        aria-label="Format Bold"
      >
        <Bold className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={`toolbar-item toolbar-button ${isItalic ? "active" : ""}`}
        aria-label="Format Italics"
      >
        <Italic className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={`toolbar-item toolbar-button ${isUnderline ? "active" : ""}`}
        aria-label="Format Underline"
      >
        <Underline className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={`toolbar-item toolbar-button ${isStrikethrough ? "active" : ""}`}
        aria-label="Format Strikethrough"
      >
        <Strikethrough className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
      <Divider />
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className="toolbar-item toolbar-button"
        aria-label="Left Align"
      >
        <AlignLeft className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="toolbar-item toolbar-button"
        aria-label="Center Align"
      >
        <AlignCenter className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="toolbar-item toolbar-button"
        aria-label="Right Align"
      >
        <AlignRight className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
      <Button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className="toolbar-item toolbar-button"
        aria-label="Justify Align"
      >
        <AlignJustify className="format w-4 text-[#1e1e1e] dark:text-white text-opacity-70" />
      </Button>
    </div>
  );
}

function useActiveBlock() {
  const [editor] = useLexicalComposerContext();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      return editor.registerUpdateListener(onStoreChange);
    },
    [editor]
  );

  const getSnapshot = useCallback(() => {
    return editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return null;

      const anchor = selection.anchor.getNode();
      let element =
        anchor.getKey() === "root"
          ? anchor
          : $findMatchingParent(anchor, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchor.getTopLevelElementOrThrow();
      }

      if ($isHeadingNode(element)) {
        return element.getTag();
      }

      return element.getType();
    });
  }, [editor]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
