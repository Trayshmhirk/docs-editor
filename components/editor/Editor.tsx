"use client";

import { editorTheme } from "./plugins/editorTheme";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { HeadingNode } from "@lexical/rich-text";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
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
import Loader from "../Loader";
import FloatingToolbarPlugin from "./plugins/FloatingToolbarPlugin";
import { useThreads } from "@liveblocks/react/suspense";
import Comments from "../Comments";
import DeleteModal from "../DeleteModal";

export function Editor({ roomId, currentUserType }: Editorprops) {
  const initialConfig = liveblocksConfig({
    namespace: "MyEditor",
    nodes: [HeadingNode],
    theme: editorTheme,
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
    editable: currentUserType === "editor",
  });

  const ready = useIsEditorReady();
  const { threads } = useThreads();

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container size-full rounded-sm text-black leading-5 text-left">
        <div className="toolbar-wrapper h-[50px] flex min-w-full justify-between items-center gap-5">
          <ToolbarPlugin />
          {currentUserType === "editor" && <DeleteModal roomId={roomId} />}
        </div>

        <div className="editor-wrapper flex flex-col items-center justify-start">
          {ready ? (
            <div className="editor-inner min-h-[1100px] relative mb-5 h-fit w-full max-w-[800px] shadow-md lg:mb-10 rounded-[3px]">
              <RichTextPlugin
                contentEditable={
                  <ContentEditable className="editor-input h-full px-7 py-8 md:p-10" />
                }
                placeholder={
                  <div className="editor-placeholder">
                    Enter some rich text...
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
              {currentUserType === "editor" && <FloatingToolbarPlugin />}
              <HistoryPlugin />
              <AutoFocusPlugin />
            </div>
          ) : (
            <Loader />
          )}

          {/* liveblocks plugin */}
          <LiveblocksPlugin>
            <FloatingComposer className="w-[350px] border border-[#2A2A2A]" />
            <FloatingThreads threads={threads} />
            <Comments />
          </LiveblocksPlugin>
        </div>
      </div>
    </LexicalComposer>
  );
}
