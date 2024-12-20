"use client";

import { RoomProvider } from "@liveblocks/react";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/ui/shared/Header";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import ActiveCollaborators from "@/components/collaborators/ActiveCollaborators";
import Loader from "@/components/ui/common/Loader";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { SquarePen } from "lucide-react";
import { updateDocument } from "@/lib/actions/room.actions";
import ShareModal from "@/components/modal/ShareModal";
import ClerkSignedInUserButton from "../ui/common/ClerkSignedInUserButton";

const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  users,
  currentUserType,
}: CollaborativeRoomProps) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      setLoading(true);

      try {
        if (documentTitle !== roomMetadata.title) {
          // update documents
          const updatedDocument = await updateDocument(roomId, documentTitle);

          if (updatedDocument) {
            setEditing(false);
          }
        }
      } catch (error) {
        console.error(`Error updating document title: ${error}`);
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = async (e: MouseEvent) => {
      if (
        editing && // Only proceed if the title is being edited
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setLoading(true); // Show "saving..." only during editing
        try {
          if (documentTitle !== roomMetadata.title) {
            await updateDocument(roomId, documentTitle);
          }
        } catch (error) {
          console.error(`Error updating document title: ${error}`);
        } finally {
          setLoading(false); // Hide loading after completing the update
          setEditing(false); // Exit editing mode
        }
      }

      setLoading(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, [roomId, documentTitle, editing, roomMetadata.title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    // Dynamically update the document title
    document.title = `Docs Editor | ${documentTitle}`;
  }, [documentTitle]);

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="flex size-full flex-1 flex-col items-center">
          <Header>
            <div ref={containerRef} className="flex w-fit items-center gap-2">
              {editing && !loading ? (
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
                <p className="line-clamp-1 border-dark-400 text-sm font-semibold leading-[24px] sm:text-lg">
                  {documentTitle}
                </p>
              )}

              {currentUserType === "editor" && !editing && (
                <SquarePen
                  className="size-5 cursor-pointer"
                  onClick={() => setEditing(true)}
                />
              )}
              {currentUserType !== "editor" && !editing && (
                <p className="rounded-md bg-dark-400/50 px-2 py-0.5 text-xs text-blue-100/50">
                  View only
                </p>
              )}
              {loading && <p className="text-sm text-gray-100">saving...</p>}
            </div>

            <div className="flex items-center gap-2 md:gap-4 justify-center">
              <ActiveCollaborators />
              <ShareModal
                roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType}
              />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <ClerkSignedInUserButton />
            </div>
          </Header>
          <Editor roomId={roomId} currentUserType={currentUserType} />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;
