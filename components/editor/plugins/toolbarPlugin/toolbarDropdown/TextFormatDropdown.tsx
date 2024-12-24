import DropDown, { DropDownItem } from "@/components/ui/lexical/dropdown";
import { FORMAT_TEXT_COMMAND, LexicalEditor } from "lexical";
import React from "react";
import { dropDownActiveClass } from "../utils";
import {
  CaseLower,
  CaseSensitive,
  CaseUpper,
  Strikethrough,
  Subscript,
  Superscript,
} from "lucide-react";
import { ToolbarState } from "@/context/ToolbarContext";
import { createCommand } from "lexical";

export const TEXT_TRANSFORM_COMMAND = createCommand<
  "lowercase" | "uppercase" | "capitalize"
>();

const TextFormatDropdown = ({
  editor,
  disabled,
  toolbarState,
}: {
  editor: LexicalEditor;
  disabled?: boolean;
  toolbarState: ToolbarState;
}) => {
  return (
    <DropDown
      disabled={disabled}
      buttonClassName="toolbar-item spaced"
      buttonLabel=""
      buttonAriaLabel="Formatting options for additional text styles"
      buttonIcon={CaseSensitive}
      buttonIconClassName="!w-6 !h-7 !text-opacity-80"
    >
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(TEXT_TRANSFORM_COMMAND, "lowercase");
        }}
        className={
          "item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b] " +
          dropDownActiveClass(toolbarState.isLowercase)
        }
        title="Lowercase"
        aria-label="Format text to lowercase"
      >
        <div className="flex items-center gap-3">
          <CaseLower className="format icon" />
          <span className="text">Lowercase</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.LOWERCASE}</span> */}
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(TEXT_TRANSFORM_COMMAND, "uppercase");
        }}
        className={
          "item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b] " +
          dropDownActiveClass(toolbarState.isUppercase)
        }
        title="Uppercase"
        aria-label="Format text to uppercase"
      >
        <div className="flex items-center gap-3">
          <CaseUpper className="format icon" />
          <span className="text">Uppercase</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.UPPERCASE}</span> */}
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(TEXT_TRANSFORM_COMMAND, "capitalize");
        }}
        className={
          "item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b] " +
          dropDownActiveClass(toolbarState.isCapitalize)
        }
        title="Capitalize"
        aria-label="Format text to capitalize"
      >
        <div className="flex items-center gap-3">
          <CaseSensitive className="format icon" />
          <span className="text">Capitalize</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.CAPITALIZE}</span> */}
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={
          "item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b] " +
          dropDownActiveClass(toolbarState.isStrikethrough)
        }
        title="Strikethrough"
        aria-label="Format text with a strikethrough"
      >
        <div className="flex items-center gap-3">
          <Strikethrough className="format icon" />
          <span className="text">Strikethrough</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.STRIKETHROUGH}</span> */}
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
        }}
        className={
          "item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b] " +
          dropDownActiveClass(toolbarState.isSubscript)
        }
        title="Subscript"
        aria-label="Format text with a subscript"
      >
        <div className="flex items-center gap-3">
          <Subscript className="format icon" />
          <span className="text">Subscript</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.SUBSCRIPT}</span> */}
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
        }}
        className={
          "item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b] " +
          dropDownActiveClass(toolbarState.isSuperscript)
        }
        title="Superscript"
        aria-label="Format text with a superscript"
      >
        <div className="flex items-center gap-3">
          <Superscript className="format icon" />
          <span className="text">Superscript</span>
        </div>
        {/* <span className="shortcut">{SHORTCUTS.SUPERSCRIPT}</span> */}
      </DropDownItem>

      {/* <DropDownItem
        onClick={() => clearFormatting(editor)}
        className="item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b]"
        title="Clear text formatting"
        aria-label="Clear all text formatting"
      >
        <div className="flex items-center gap-3">
          <i className="icon clear" />
          <Trash2 className="format icon" />
          <span className="text">Clear Formatting</span>
        </div>
      </DropDownItem> */}
    </DropDown>
  );
};

export default TextFormatDropdown;

/* <span className="shortcut">{SHORTCUTS.CLEAR_FORMATTING}</span> */
