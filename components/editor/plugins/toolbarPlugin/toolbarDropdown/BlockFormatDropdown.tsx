import { LexicalEditor } from "lexical";
import { blockTypeToBlockName } from "@/context/ToolbarContext";
import DropDown, { DropDownItem } from "@/components/ui/lexical/dropdown";
import {
  formatBulletList,
  formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,
} from "../utils";
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListChecks,
  ListOrdered,
  MessageSquareQuote,
  Text,
} from "lucide-react";
import { getBlockTypeIcon } from "../utils";
import { dropDownActiveClass } from "../utils";

type rootTypeToRootName = {
  root: "Root";
  table: "Table";
};

export default function BlockFormatDropDown({
  editor,
  blockType,
  // rootType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): React.JSX.Element {
  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item"
      buttonIcon={getBlockTypeIcon(blockType)}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style"
    >
      <DropDownItem
        className={
          "item wide text-foreground hover:enabled:bg-surface-hover flex w-56 max-w-56 min-w-28 items-center justify-between rounded-lg p-2 text-xs transition-colors " +
          dropDownActiveClass(blockType === "paragraph")
        }
        onClick={() => formatParagraph(editor)}
      >
        <div className="flex items-center gap-2.5">
          <Text className="format icon size-4" />
          <span className="text">Normal</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide text-foreground hover:enabled:bg-surface-hover flex w-56 max-w-56 min-w-28 items-center justify-between rounded-lg p-2 text-xs transition-colors " +
          dropDownActiveClass(blockType === "h1")
        }
        onClick={() => formatHeading(editor, blockType, "h1")}
      >
        <div className="flex items-center gap-2.5">
          <Heading1 className="format icon size-4" />
          <span className="text">Heading 1</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide text-foreground hover:enabled:bg-surface-hover flex w-56 max-w-56 min-w-28 items-center justify-between rounded-lg p-2 text-xs transition-colors " +
          dropDownActiveClass(blockType === "h2")
        }
        onClick={() => formatHeading(editor, blockType, "h2")}
      >
        <div className="flex items-center gap-2.5">
          <Heading2 className="format icon size-4" />
          <span className="text">Heading 2</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide text-foreground hover:enabled:bg-surface-hover flex w-56 max-w-56 min-w-28 items-center justify-between rounded-lg p-2 text-xs transition-colors " +
          dropDownActiveClass(blockType === "h3")
        }
        onClick={() => formatHeading(editor, blockType, "h3")}
      >
        <div className="flex items-center gap-2.5">
          <Heading3 className="format icon size-4" />
          <span className="text">Heading 3</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide text-foreground hover:enabled:bg-surface-hover flex w-56 max-w-56 min-w-28 items-center justify-between rounded-lg p-2 text-xs transition-colors " +
          dropDownActiveClass(blockType === "bullet")
        }
        onClick={() => formatBulletList(editor, blockType)}
      >
        <div className="flex items-center gap-2.5">
          <List className="format icon size-4" />
          <span className="text">Bullet List</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide text-foreground hover:enabled:bg-surface-hover flex w-56 max-w-56 min-w-28 items-center justify-between rounded-lg p-2 text-xs transition-colors " +
          dropDownActiveClass(blockType === "number")
        }
        onClick={() => formatNumberedList(editor, blockType)}
      >
        <div className="flex items-center gap-2.5">
          <ListOrdered className="format icon size-4" />
          <span className="text">Numbered List</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide text-foreground hover:enabled:bg-surface-hover flex w-56 max-w-56 min-w-28 items-center justify-between rounded-lg p-2 text-xs transition-colors " +
          dropDownActiveClass(blockType === "check")
        }
        onClick={() => formatCheckList(editor, blockType)}
      >
        <div className="flex items-center gap-2.5">
          <ListChecks className="format icon size-4" />
          <span className="text">Check List</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide text-foreground hover:enabled:bg-surface-hover flex w-56 max-w-56 min-w-28 items-center justify-between rounded-lg p-2 text-xs transition-colors " +
          dropDownActiveClass(blockType === "quote")
        }
        onClick={() => formatQuote(editor, blockType)}
      >
        <div className="flex items-center gap-2.5">
          <MessageSquareQuote className="format icon size-4" />
          <span className="text">Quote</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide text-foreground hover:enabled:bg-surface-hover flex w-56 max-w-56 min-w-28 items-center justify-between rounded-lg p-2 text-xs transition-colors " +
          dropDownActiveClass(blockType === "code")
        }
        onClick={() => formatCode(editor, blockType)}
      >
        <div className="flex items-center gap-2.5">
          <Code className="format icon size-4" />
          <span className="text">Code Block</span>
        </div>
      </DropDownItem>
    </DropDown>
  );
}
