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

const initialConfig = {
   namespace: "MyEditor",
   nodes: [HeadingNode],
   theme: editorTheme,
   onError: (error: Error) => {
      console.error(error);
      throw error;
   },
   // editable: currentUserType === "editor",
};

export function Editor() {
   return (
      <LexicalComposer initialConfig={initialConfig}>
         <div className="editor-container size-full">
            <div className="toolbar-wrapper flex min-w-full justify-between">
               <ToolbarPlugin />
               {/* {currentUserType === "editor"} && <DeleteModal roomId={roomId}/>*/}
            </div>

            <div className="editor-wrapper flex flex-col items-center justify-start">
               <div className="editor-inner min-h-[1100px] relative mb-5 h-fit w-full max-w-[800px] shadow-md lg:mb-10">
                  <RichTextPlugin
                     contentEditable={
                        <ContentEditable className="editor-input h-full" />
                     }
                     placeholder={
                        <div className="editor-placeholder">
                           Enter some rich text...
                        </div>
                     }
                     ErrorBoundary={LexicalErrorBoundary}
                  />
                  {/* {currentUserType === 'editor' && <FloatingToolbarPlugin />} */}
                  <HistoryPlugin />
                  <AutoFocusPlugin />
               </div>

               {/* liveblocks plugin */}
            </div>
         </div>
      </LexicalComposer>
   );
}
