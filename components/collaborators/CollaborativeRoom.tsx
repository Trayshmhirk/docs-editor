"use client";

import { RoomProvider, useStatus } from "@liveblocks/react";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/ui/shared/Header";
import { Show, SignInButton } from "@clerk/nextjs";
import ActiveCollaborators from "@/components/collaborators/ActiveCollaborators";
import Loader from "@/components/ui/common/Loader";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { SquarePen } from "lucide-react";
import { updateDocument } from "@/lib/actions/room.actions";
import ShareModal from "@/components/modal/ShareModal";
import ClerkSignedInUserButton from "../ui/common/ClerkSignedInUserButton";

function ConnectionStatusBadge() {
  const status = useStatus();

  if (status === "connected") {
    return (
      <span
        title="Connected to collaboration server"
        className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
      >
        <span className="size-1.5 rounded-full bg-emerald-500" />
        <span className="hidden md:inline">Connected</span>
      </span>
    );
  }

  if (status === "reconnecting" || status === "connecting") {
    return (
      <span
        title="Connecting to collaboration server..."
        className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400"
      >
        <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
        <span className="hidden md:inline">Connecting</span>
      </span>
    );
  }

  if (status === "disconnected") {
    return (
      <span
        title="Disconnected from collaboration server"
        className="flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400"
      >
        <span className="size-1.5 rounded-full bg-rose-500" />
        <span className="hidden md:inline">Offline</span>
      </span>
    );
  }

  return null;
}

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

  const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setLoading(true);

      try {
        if (documentTitle !== roomMetadata.title) {
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
      if (editing && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setLoading(true);
        try {
          if (documentTitle !== roomMetadata.title) {
            await updateDocument(roomId, documentTitle);
          }
        } catch (error) {
          console.error(`Error updating document title: ${error}`);
        } finally {
          setLoading(false);
          setEditing(false);
        }
      }

      setLoading(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [roomId, documentTitle, editing, roomMetadata.title]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  useEffect(() => {
    document.title = `Docs Editor | ${documentTitle}`;
  }, [documentTitle]);

  return (
    <RoomProvider id={roomId} initialPresence={{ cursor: null }}>
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
                <p className="border-dark-400 line-clamp-1 text-sm leading-6 font-semibold sm:text-lg">
                  {documentTitle}
                </p>
              )}

              {currentUserType === "editor" && !editing && (
                <SquarePen className="size-5 cursor-pointer" onClick={() => setEditing(true)} />
              )}
              {currentUserType !== "editor" && !editing && (
                <p className="bg-dark-400/50 rounded-md px-2 py-0.5 text-xs text-blue-100/50">
                  View only
                </p>
              )}
              {loading && <p className="text-sm text-gray-100">saving...</p>}
            </div>

            <div className="flex items-center justify-center gap-2 md:gap-4">
              <ConnectionStatusBadge />
              <ActiveCollaborators />
              <ShareModal
                roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType}
              />
              <Show when="signed-out">
                <SignInButton />
              </Show>
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
