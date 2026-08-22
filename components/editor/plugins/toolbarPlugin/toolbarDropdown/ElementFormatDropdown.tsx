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
  return <div className="bg-border mx-1 my-1 h-px w-full" />;
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
        className="item text-foreground hover:enabled:bg-surface-hover flex min-w-32 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors"
      >
        <div className="icon-text-container flex items-center gap-2.5">
          <AlignLeft className="format icon size-4" />
          <span className="text">Left Align</span>
        </div>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="item text-foreground hover:enabled:bg-surface-hover flex min-w-32 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors"
      >
        <div className="icon-text-container flex items-center gap-2.5">
          <AlignCenter className="format icon size-4" />
          <span className="text">Center Align</span>
        </div>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="item text-foreground hover:enabled:bg-surface-hover flex min-w-32 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors"
      >
        <div className="icon-text-container flex items-center gap-2.5">
          <AlignRight className="format icon size-4" />
          <span className="text">Right Align</span>
        </div>
      </DropDownItem>
      <DropDownItem
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className="item text-foreground hover:enabled:bg-surface-hover flex min-w-32 items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors"
      >
        <div className="icon-text-container flex items-center gap-2.5">
          <AlignJustify className="format icon size-4" />
          <span className="text">Justify Align</span>
        </div>
      </DropDownItem>
    </DropDown>
  );
}
