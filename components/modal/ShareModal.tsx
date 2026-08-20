"use client";

import { useState } from "react";
import { useSelf } from "@liveblocks/react/suspense";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Copy, Share } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import UserTypeSelector from "@/components/ui/common/UserTypeSelector";
import Collaborator from "@/components/collaborators/Collaborator";
import { updateDocumentAccess } from "@/lib/actions/room.actions";

const ShareModal = ({
  roomId,
  collaborators,
  creatorId,
  currentUserType,
}: ShareDocumentDialogProps) => {
  const user = useSelf();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<UserType>("viewer");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleShareDocument = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter an email address");
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      await updateDocumentAccess({
        roomId,
        email: trimmedEmail,
        userType: userType as UserType,
        updatedBy: user.info,
      });
      setEmail("");
    } catch (error) {
      console.error("Error updating document access:", error);
      setErrorMessage("Failed to invite collaborator");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="dark:shadow-lg-dark flex h-9 items-center gap-1 bg-[#00afdb] px-4 font-medium shadow-lg transition-all duration-300 ease-in-out hover:bg-[#0081a4] dark:bg-[#00afdb] dark:text-white dark:hover:bg-[#0081a4]"
          disabled={currentUserType !== "editor"}
        >
          <Share className="min-w-4 md:size-5" />
          <p className="hidden sm:block">Share</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="dark:!gradient-darkgray flex w-full max-w-100 flex-col gap-6 rounded-xl border-none px-5 py-7 shadow-xl sm:min-w-125">
        <DialogHeader>
          <DialogTitle>Manage who can view this project</DialogTitle>
          <DialogDescription className="text-[#969696] dark:text-[#b0b0b0]">
            Select which users can view and edit this document
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Label htmlFor="email" className="text-[#555555] dark:text-[#d8d8d8]">
            Email address
          </Label>
          <div className="flex items-stretch gap-3">
            <div className="flex flex-1 items-center rounded-md bg-[#f5f5f5] dark:bg-[#404040]">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                className="h-11 flex-1 border-none bg-[#f5f5f5] placeholder:text-[#a1a1a1] focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-[#404040]"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
              />
              <UserTypeSelector userType={userType} setUserType={setUserType} />
            </div>

            <Button
              type="submit"
              onClick={handleShareDocument}
              className="dark:shadow-lg-dark h-11 bg-[#00afdb] px-5 shadow-lg transition-colors duration-200 ease-in-out hover:bg-[#0081a4] dark:bg-[#00afdb] dark:text-white dark:hover:bg-[#0081a4]"
              disabled={loading}
            >
              {loading ? "sending..." : "Invite"}
            </Button>
          </div>
          {errorMessage && <p className="text-xs text-rose-500">{errorMessage}</p>}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[#e5e5e5] p-3 dark:border-[#333333]">
          <div className="flex flex-col">
            <p className="text-xs font-semibold text-[#1e1e1e] dark:text-white">Share link</p>
            <p className="text-xs text-[#888888] dark:text-[#aaaaaa]">
              Anyone with access can view this document
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 border-[#cccccc] text-xs dark:border-[#555555]"
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          <ul className="flex flex-col gap-1">
            {collaborators.map((collaborator) => (
              <Collaborator
                key={collaborator.id}
                roomId={roomId}
                email={collaborator.email}
                collaborator={collaborator}
                creatorId={creatorId}
                user={user.info}
              />
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
