import DropDown, { DropDownItem } from "@/components/ui/lexical/dropdown";
import { FORMAT_TEXT_COMMAND, LexicalEditor } from "lexical";
import React from "react";
import { clearFormatting, dropDownActiveClass } from "../utils";
import {
  CaseLower,
  CaseSensitive,
  CaseUpper,
  Strikethrough,
  Subscript,
  Superscript,
  Trash2,
} from "lucide-react";
import { ToolbarState } from "@/context/ToolbarContext";

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
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "lowercase");
        }}
        className={
          "item text-foreground hover:enabled:bg-surface-hover flex min-w-36 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors " +
          dropDownActiveClass(toolbarState.isLowercase)
        }
        title="Lowercase"
        aria-label="Format text to lowercase"
      >
        <div className="flex items-center gap-2.5">
          <CaseLower className="format icon size-4" />
          <span className="text">Lowercase</span>
        </div>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "uppercase");
        }}
        className={
          "item text-foreground hover:enabled:bg-surface-hover flex min-w-36 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors " +
          dropDownActiveClass(toolbarState.isUppercase)
        }
        title="Uppercase"
        aria-label="Format text to uppercase"
      >
        <div className="flex items-center gap-2.5">
          <CaseUpper className="format icon size-4" />
          <span className="text">Uppercase</span>
        </div>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "capitalize");
        }}
        className={
          "item text-foreground hover:enabled:bg-surface-hover flex min-w-36 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors " +
          dropDownActiveClass(toolbarState.isCapitalize)
        }
        title="Capitalize"
        aria-label="Format text to capitalize"
      >
        <div className="flex items-center gap-2.5">
          <CaseSensitive className="format icon size-4" />
          <span className="text">Capitalize</span>
        </div>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={
          "item text-foreground hover:enabled:bg-surface-hover flex min-w-36 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors " +
          dropDownActiveClass(toolbarState.isStrikethrough)
        }
        title="Strikethrough"
        aria-label="Format text with a strikethrough"
      >
        <div className="flex items-center gap-2.5">
          <Strikethrough className="format icon size-4" />
          <span className="text">Strikethrough</span>
        </div>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "subscript");
        }}
        className={
          "item text-foreground hover:enabled:bg-surface-hover flex min-w-36 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors " +
          dropDownActiveClass(toolbarState.isSubscript)
        }
        title="Subscript"
        aria-label="Format text with a subscript"
      >
        <div className="flex items-center gap-2.5">
          <Subscript className="format icon size-4" />
          <span className="text">Subscript</span>
        </div>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "superscript");
        }}
        className={
          "item text-foreground hover:enabled:bg-surface-hover flex min-w-36 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors " +
          dropDownActiveClass(toolbarState.isSuperscript)
        }
        title="Superscript"
        aria-label="Format text with a superscript"
      >
        <div className="flex items-center gap-2.5">
          <Superscript className="format icon size-4" />
          <span className="text">Superscript</span>
        </div>
      </DropDownItem>

      <DropDownItem
        onClick={() => clearFormatting(editor)}
        className="item text-foreground hover:enabled:bg-surface-hover flex min-w-36 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors"
        title="Clear text formatting"
        aria-label="Clear all text formatting"
      >
        <div className="flex items-center gap-2.5">
          <Trash2 className="format icon size-4" />
          <span className="text">Clear Formatting</span>
        </div>
      </DropDownItem>
    </DropDown>
  );
};

export default TextFormatDropdown;
