"use client";
import { editorTheme } from "./plugins/editorTheme";
import ToolbarPlugin from "./plugins/toolbarPlugin/ToolbarPlugin";
import CodeHighlightPlugin from "./plugins/codeHighlightPlugin";
import CodeActionMenuPlugin from "./plugins/codeActionMenuPlugin";

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

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);

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
        <div className="size-full rounded-sm  bg-[#f0f2f5] dark:bg-[#111111] text-black leading-5 text-left">
          <div className="toolbar-wrapper h-[50px] flex min-w-full justify-between items-center gap-5">
            <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />

            <div className="flex gap-1 items-center">
              <ToggleTheme isEditor />
              {currentUserType === "editor" && <DeleteModal roomId={roomId} />}
            </div>
          </div>

          <div className="editor-wrapper flex flex-col items-center justify-start gap-5 overflow-auto p-4 pb-8 lg:flex-row lg:items-start lg:justify-center md:p-6 md:pt-7 md:pb-8 xl:gap-10">
            {ready ? (
              <div className="min-h-[1100px] relative h-fit w-full max-w-[800px] bg-white dark:bg-[#212121] mb-5 rounded-[3px] shadow-lg">
                <RichTextPlugin
                  contentEditable={
                    <div className="editor" ref={onRef}>
                      <ContentEditable className="editor-input relative h-full text-[#1e1e1e] dark:text-white caret-[#1d1d1d] dark:caret-[#d8d8d8] px-7 py-8 md:p-10" />
                    </div>
                  }
                  placeholder={
                    <div className="editor-placeholder absolute top-10 left-10 inline-block text-[15px] text-[#888888] dark:text-[#aaaaaa]">
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
                  </>
                )}
                <LinkPlugin hasLinkAttributes={hasLinkAttributes} />
              </div>
            ) : (
              <Loader />
            )}

            {/* liveblocks plugin */}
            <LiveblocksPlugin>
              <FloatingComposer className="w-[350px] border border-[#cccccc] dark:border-[#444444] rounded-md overflow-hidden" />
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
