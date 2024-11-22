"use client";

import { RoomProvider } from "@liveblocks/react";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import ActiveCollaborators from "./ActiveCollaborators";
import Loader from "./Loader";
import { RoomData } from "@liveblocks/node";
import { useRef, useState } from "react";
import { Input } from "./ui/input";
import { SquarePen } from "lucide-react";

const CollaborativeRoom = ({
   roomId,
   roomMetadata, // TODO: Access permissions of users to access the document
}: CollaborativeRoomProps) => {
   const currentUserType = "editor";

   const [editing, setEditing] = useState(false);
   const [loading, setLoading] = useState(false);
   const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);

   const containerRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);

   const updateTitleHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {};

   return (
      <RoomProvider id={roomId}>
         <ClientSideSuspense fallback={<Loader />}>
            <div className="flex size-full max-h-screen flex-1 flex-col items-center overflow-hidden">
               <Header>
                  <div
                     ref={containerRef}
                     className="flex w-fit items-center gap-2"
                  >
                     {editing && loading ? (
                        <Input
                           type="text"
                           value={documentTitle}
                           ref={inputRef}
                           placeholder="Enter title"
                           onChange={(e) => setDocumentTitle(e.target.value)}
                           onKeyDown={updateTitleHandler}
                           disabled={!editing}
                           className="document-title-input"
                        />
                     ) : (
                        <p className="line-clamp-1 border-dark-400 text-base font-semibold leading-[24px] sm:pl-0 sm:text-xl">
                           {documentTitle}
                        </p>
                     )}

                     {currentUserType === "editor" && !editing && (
                        <SquarePen
                           className="size-6 cursor-pointer"
                           onClick={() => setEditing(true)}
                        />
                     )}
                     {currentUserType !== "editor" && !editing && (
                        <p className="rounded-md bg-dark-400/50 px-2 py-0.5 text-xs text-blue-100/50">
                           View only
                        </p>
                     )}
                     {loading && (
                        <p className="text-sm text-gray-100">saving...</p>
                     )}
                  </div>

                  <div className="flex items-center gap-3 justify-center">
                     <ActiveCollaborators />

                     <SignedOut>
                        <SignInButton />
                     </SignedOut>
                     <SignedIn>
                        <UserButton />
                     </SignedIn>
                  </div>
               </Header>
               <Editor />
            </div>
         </ClientSideSuspense>
      </RoomProvider>
   );
};

export default CollaborativeRoom;