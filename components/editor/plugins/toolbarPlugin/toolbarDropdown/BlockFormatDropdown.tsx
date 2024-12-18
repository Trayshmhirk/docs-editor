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
  dropDownActiveClass,
} from "../utils";

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
      buttonClassName="toolbar-item block-controls"
      buttonIconClassName={"icon block-type " + blockType}
      buttonLabel={blockTypeToBlockName[blockType]}
      buttonAriaLabel="Formatting options for text style"
    >
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded-lg  " +
          dropDownActiveClass(blockType === "paragraph")
        }
        onClick={() => formatParagraph(editor)}
      >
        <div className="icon-text-container">
          <i className="icon paragraph" />
          <span className="text">Normal</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.NORMAL}</span> */}
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded-lg  " +
          dropDownActiveClass(blockType === "h1")
        }
        onClick={() => formatHeading(editor, blockType, "h1")}
      >
        <div className="icon-text-container">
          <i className="icon h1" />
          <span className="text">Heading 1</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.HEADING1}</span> */}
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded-lg  " +
          dropDownActiveClass(blockType === "h2")
        }
        onClick={() => formatHeading(editor, blockType, "h2")}
      >
        <div className="icon-text-container">
          <i className="icon h2" />
          <span className="text">Heading 2</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.HEADING2}</span> */}
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded-lg  " +
          dropDownActiveClass(blockType === "h3")
        }
        onClick={() => formatHeading(editor, blockType, "h3")}
      >
        <div className="icon-text-container">
          <i className="icon h3" />
          <span className="text">Heading 3</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.HEADING3}</span> */}
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded-lg  " +
          dropDownActiveClass(blockType === "bullet")
        }
        onClick={() => formatBulletList(editor, blockType)}
      >
        <div className="icon-text-container">
          <i className="icon bullet-list" />
          <span className="text">Bullet List</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.BULLET_LIST}</span> */}
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded-lg  " +
          dropDownActiveClass(blockType === "number")
        }
        onClick={() => formatNumberedList(editor, blockType)}
      >
        <div className="icon-text-container">
          <i className="icon numbered-list" />
          <span className="text">Numbered List</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.NUMBERED_LIST}</span> */}
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded-lg  " +
          dropDownActiveClass(blockType === "check")
        }
        onClick={() => formatCheckList(editor, blockType)}
      >
        <div className="icon-text-container">
          <i className="icon check-list" />
          <span className="text">Check List</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.CHECK_LIST}</span> */}
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded-lg  " +
          dropDownActiveClass(blockType === "quote")
        }
        onClick={() => formatQuote(editor, blockType)}
      >
        <div className="icon-text-container">
          <i className="icon quote" />
          <span className="text">Quote</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.QUOTE}</span> */}
      </DropDownItem>
      <DropDownItem
        className={
          "item wide w-[250px] max-w-[250px] min-w-[100px] text-[15px] flex items-center justify-between p-2 rounded-lg  " +
          dropDownActiveClass(blockType === "code")
        }
        onClick={() => formatCode(editor, blockType)}
      >
        <div className="icon-text-container">
          <i className="icon code" />
          <span className="text">Code Block</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.CODE_BLOCK}</span> */}
      </DropDownItem>
    </DropDown>
  );
}
