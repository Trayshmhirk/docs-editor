import DropDown, { DropDownItem } from "@/components/ui/lexical/dropdown";
import {
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  // INDENT_CONTENT_COMMAND,
  LexicalEditor,
  // OUTDENT_CONTENT_COMMAND,
} from "lexical";
import { AlignCenter, AlignJustify, AlignLeft, AlignRight } from "lucide-react";

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, "">]: {
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    iconRTL: React.FC<React.SVGProps<SVGSVGElement>>;
    name: string;
  };
} = {
  center: {
    icon: AlignCenter,
    iconRTL: AlignCenter,
    name: "Center Align",
  },
  end: {
    icon: AlignRight,
    iconRTL: AlignLeft,
    name: "End Align",
  },
  justify: {
    icon: AlignJustify,
    iconRTL: AlignJustify,
    name: "Justify Align",
  },
  left: {
    icon: AlignLeft,
    iconRTL: AlignLeft,
    name: "Left Align",
  },
  right: {
    icon: AlignRight,
    iconRTL: AlignRight,
    name: "Right Align",
  },
  start: {
    icon: AlignLeft,
    iconRTL: AlignRight,
    name: "Start Align",
  },
};

function Divider() {
  return (
    <div className="w-full h-[1px] bg-[#dedede] dark:bg-[#3b3b3b] my-1 mx-2" />
  );
}

export function ElementFormatDropdown({
  editor,
  value,
  disabled = false,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  disabled: boolean;
}) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || "left"];

  return (
    <DropDown
      disabled={disabled}
      buttonLabel={formatOption.name}
      buttonIcon={formatOption.icon}
      buttonClassName="toolbar-item spaced alignment"
      buttonAriaLabel="Formatting options for text alignment"
    >
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className="item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b]"
      >
        <div className="icon-text-container flex items-center gap-3">
          <AlignLeft className="format icon" />
          <span className="text">Left Align</span>
        </div>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b]"
      >
        <div className="icon-text-container flex items-center gap-3">
          <AlignCenter className="format icon" />
          <span className="text">Center Align</span>
        </div>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b]"
      >
        <div className="icon-text-container flex items-center gap-3">
          <AlignRight className="format icon" />
          <span className="text">Right Align</span>
        </div>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className="item min-w-[100px] text-sm flex items-center justify-between py-1 px-2 rounded hover:enabled:bg-[#eee] dark:hover:enabled:bg-[#3b3b3b]"
      >
        <div className="icon-text-container flex items-center gap-3">
          <AlignJustify className="format icon" />
          <span className="text">Justify Align</span>
        </div>
      </DropDownItem>
    </DropDown>
  );
}
