"use client";
import dynamic from "next/dynamic";
import { editorTheme } from "./plugins/editorTheme";
import ToolbarPlugin from "./plugins/toolbarPlugin/ToolbarPlugin";
import CodeHighlightPlugin from "./plugins/codeHighlightPlugin";

const CodeActionMenuPlugin = dynamic(() => import("./plugins/codeActionMenuPlugin"), {
  ssr: false,
});
const FloatingLinkEditorPlugin = dynamic(() => import("./plugins/floatingLinkEditorPlugin"), {
  ssr: false,
});

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
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
import { useEffect, useState } from "react";
import { ToolbarContext } from "@/context/ToolbarContext";
import { DocumentLayoutProvider } from "@/context/DocumentLayoutContext";
import PlaygroundNodes from "./nodes/playgroundNodes";
import { CAN_USE_DOM } from "@lexical/utils";
import LinkPlugin from "./plugins/linkPlugin";
import { useSettings } from "@/context/SettingsContext";

import EditorShell from "./EditorShell";
import TableEscapePlugin from "./plugins/TableEscapePlugin";

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
      <DocumentLayoutProvider>
        <ToolbarContext>
          <div className="bg-surface-canvas text-foreground flex size-full flex-1 flex-col overflow-hidden text-left leading-5">
            <div className="toolbar-wrapper border-border z-20 flex min-h-11 min-w-full items-center justify-between gap-4 border-b">
              <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
            </div>

            <EditorShell>
              {ready ? (
                <>
                  <RichTextPlugin
                    contentEditable={
                      <div className="editor relative min-h-full" ref={onRef}>
                        <ContentEditable className="editor-input text-foreground relative min-h-175 caret-current outline-none" />
                      </div>
                    }
                    placeholder={
                      <div className="editor-placeholder text-muted pointer-events-none absolute top-24 left-24 inline-block text-sm select-none max-md:top-6 max-md:left-4">
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
                  <TablePlugin />
                  <TableEscapePlugin />
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
                </>
              ) : (
                <div className="flex min-h-100 items-center justify-center">
                  <Loader />
                </div>
              )}

              {/* liveblocks plugin */}
              <LiveblocksPlugin>
                <FloatingComposer className="border-border bg-surface w-87.5 overflow-hidden rounded-xl border shadow-2xl" />
                <FloatingThreads
                  threads={threads}
                  className="border-border bg-surface rounded-xl border shadow-2xl"
                />
                <Comments />
              </LiveblocksPlugin>
            </EditorShell>
          </div>
        </ToolbarContext>
      </DocumentLayoutProvider>
    </LexicalComposer>
  );
}
