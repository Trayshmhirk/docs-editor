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
          className="bg-primary text-primary-foreground hover:bg-primary-hover flex h-9 items-center gap-1.5 px-3.5 text-xs font-medium shadow-sm transition-all"
          disabled={currentUserType !== "editor"}
        >
          <Share className="size-4" />
          <p className="hidden sm:block">Share</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="flex w-full max-w-lg flex-col gap-6 p-6">
        <DialogHeader>
          <DialogTitle className="text-foreground text-lg font-semibold">
            Manage who can view this project
          </DialogTitle>
          <DialogDescription className="text-muted text-xs">
            Select which users can view and edit this document
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2.5">
          <Label htmlFor="email" className="text-foreground text-xs font-medium">
            Email address
          </Label>
          <div className="flex items-stretch gap-2.5">
            <div className="border-border bg-surface-secondary flex flex-1 items-center rounded-lg border">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                className="placeholder:text-muted h-10 flex-1 border-none bg-transparent px-3 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
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
              className="bg-primary text-primary-foreground hover:bg-primary-hover h-10 px-4 text-xs font-medium shadow-sm transition-colors"
              disabled={loading}
            >
              {loading ? "Sending..." : "Invite"}
            </Button>
          </div>
          {errorMessage && <p className="text-destructive text-xs">{errorMessage}</p>}
        </div>

        <div className="border-border bg-surface-canvas flex items-center justify-between rounded-xl border p-3.5">
          <div className="flex flex-col">
            <p className="text-foreground text-xs font-medium">Share link</p>
            <p className="text-muted text-xs">Anyone with access can view this document</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 text-xs"
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
