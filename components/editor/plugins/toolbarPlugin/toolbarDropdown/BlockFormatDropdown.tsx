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
}): JSX.Element {
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
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b] " +
          dropDownActiveClass(blockType === "paragraph")
        }
        onClick={() => formatParagraph(editor)}
      >
        <div className="flex items-center gap-3">
          <Text className="format icon" />
          <span className="text">Normal</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded hover:bg-[#eee] dark:hover:bg-[#3b3b3b] " +
          dropDownActiveClass(blockType === "h1")
        }
        onClick={() => formatHeading(editor, blockType, "h1")}
      >
        <div className="flex items-center gap-3">
          <Heading1 className="format icon" />
          <span className="text">Heading 1</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded hover:bg-[#eee] dark:hover:bg-[#3b3b3b] " +
          dropDownActiveClass(blockType === "h2")
        }
        onClick={() => formatHeading(editor, blockType, "h2")}
      >
        <div className="flex items-center gap-3">
          <Heading2 className="format icon" />
          <span className="text">Heading 2</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded hover:bg-[#eee] dark:hover:bg-[#3b3b3b] " +
          dropDownActiveClass(blockType === "h3")
        }
        onClick={() => formatHeading(editor, blockType, "h3")}
      >
        <div className="flex items-center gap-3">
          <Heading3 className="format icon" />
          <span className="text">Heading 3</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded hover:bg-[#eee] dark:hover:bg-[#3b3b3b] " +
          dropDownActiveClass(blockType === "bullet")
        }
        onClick={() => formatBulletList(editor, blockType)}
      >
        <div className="flex items-center gap-3">
          <List className="format icon" />
          <span className="text">Bullet List</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded hover:bg-[#eee] dark:hover:bg-[#3b3b3b]" +
          dropDownActiveClass(blockType === "number")
        }
        onClick={() => formatNumberedList(editor, blockType)}
      >
        <div className="flex items-center gap-3">
          <ListOrdered className="format icon" />
          <span className="text">Numbered List</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded hover:bg-[#eee] dark:hover:bg-[#3b3b3b] " +
          dropDownActiveClass(blockType === "check")
        }
        onClick={() => formatCheckList(editor, blockType)}
      >
        <div className="flex items-center gap-3">
          <ListChecks className="format icon" />
          <span className="text">Check List</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded hover:bg-[#eee] dark:hover:bg-[#3b3b3b] " +
          dropDownActiveClass(blockType === "quote")
        }
        onClick={() => formatQuote(editor, blockType)}
      >
        <div className="flex items-center gap-3">
          <MessageSquareQuote className="format icon" />
          <span className="text">Quote</span>
        </div>
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded hover:bg-[#eee] dark:hover:bg-[#3b3b3b] " +
          dropDownActiveClass(blockType === "code")
        }
        onClick={() => formatCode(editor, blockType)}
      >
        <div className="flex items-center gap-3">
          <Code className="format icon" />
          <span className="text">Code Block</span>
        </div>
      </DropDownItem>
    </DropDown>
  );
}
