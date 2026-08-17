"use client";
import { editorTheme } from "./plugins/editorTheme";
import ToolbarPlugin from "./plugins/toolbarPlugin/ToolbarPlugin";
import CodeHighlightPlugin from "./plugins/codeHighlightPlugin";
import CodeActionMenuPlugin from "./plugins/codeActionMenuPlugin";
import DraggableBlockPlugin from "./plugins/draggableBlockPlugin";

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  FloatingComposer,
  FloatingThreads,
  liveblocksConfig,
  LiveblocksPlugin,
  useIsEditorReady,
} from "@liveblocks/react-lexical";

import Loader from "@/components/ui/common/Loader";
import FloatingToolbarPlugin from "./plugins/FloatingToolbarPlugin";
import { useThreads } from "@liveblocks/react/suspense";
import Comments from "@/components/ui/liveblocks/Comments";
import DeleteModal from "@/components/modal/DeleteModal";
import { ToggleTheme } from "../ui/common/ToggleTheme";
import { useEffect, useState } from "react";
import { ToolbarContext } from "@/context/ToolbarContext";
import PlaygroundNodes from "./nodes/playgroundNodes";
import { CAN_USE_DOM } from "@lexical/utils";
import LinkPlugin from "./plugins/linkPlugin";
import { useSettings } from "@/context/SettingsContext";
import FloatingLinkEditorPlugin from "./plugins/floatingLinkEditorPlugin";

export function Editor({ roomId, currentUserType }: Editorprops) {
  const initialConfig = liveblocksConfig({
    namespace: "MyEditor",
    nodes: [...PlaygroundNodes],
    theme: editorTheme,
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    editable: currentUserType === "editor",
  });

  const {
    settings: { hasLinkAttributes },
  } = useSettings();

  const ready = useIsEditorReady();
  const { threads } = useThreads();
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia("(max-width: 1025px)").matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);

    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ToolbarContext>
        <div className="size-full rounded-sm bg-[#f0f2f5] text-left leading-5 text-black dark:bg-[#111111]">
          <div className="toolbar-wrapper flex h-[50px] min-w-full items-center justify-between gap-5">
            <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />

            <div className="flex items-center gap-1">
              <ToggleTheme isEditor />
              {currentUserType === "editor" && <DeleteModal roomId={roomId} />}
            </div>
          </div>

          <div className="editor-wrapper flex flex-col items-center justify-start gap-5 overflow-auto p-4 pb-8 md:p-6 md:pb-8 md:pt-7 lg:flex-row lg:items-start lg:justify-center xl:gap-10">
            {ready ? (
              <div className="relative mb-5 h-full min-h-[1100px] w-full max-w-[800px] rounded-[3px] bg-white shadow-lg dark:bg-[#212121]">
                <RichTextPlugin
                  contentEditable={
                    <div className="editor h-full" ref={onRef}>
                      <ContentEditable className="editor-input relative h-full px-7 py-8 text-[#1e1e1e] caret-[#1d1d1d] dark:text-white dark:caret-[#d8d8d8] md:p-10" />
                    </div>
                  }
                  placeholder={
                    <div className="editor-placeholder absolute left-10 top-10 inline-block text-[15px] text-[#888888] dark:text-[#aaaaaa]">
                      Enter some rich text...
                    </div>
                  }
                  ErrorBoundary={LexicalErrorBoundary}
                />
                {currentUserType === "editor" && <FloatingToolbarPlugin />}
                <HistoryPlugin />
                <AutoFocusPlugin />
                <ListPlugin />
                <CheckListPlugin />
                <CodeHighlightPlugin />
                {floatingAnchorElem && !isSmallWidthViewport && (
                  <>
                    <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                    <FloatingLinkEditorPlugin
                      anchorElem={floatingAnchorElem}
                      isLinkEditMode={isLinkEditMode}
                      setIsLinkEditMode={setIsLinkEditMode}
                    />
                    <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                  </>
                )}
                <LinkPlugin hasLinkAttributes={hasLinkAttributes} />
              </div>
            ) : (
              <Loader />
            )}

            {/* liveblocks plugin */}
            <LiveblocksPlugin>
              <FloatingComposer className="w-[350px] overflow-hidden rounded-md border border-[#cccccc] dark:border-[#444444]" />
              <FloatingThreads
                threads={threads}
                className="border border-[#cccccc] dark:border-[#444444]"
              />
              <Comments />
            </LiveblocksPlugin>
          </div>
        </div>
      </ToolbarContext>
    </LexicalComposer>
  );
}
