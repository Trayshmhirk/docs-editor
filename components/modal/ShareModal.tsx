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
import { Share } from "lucide-react";
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

  const handleShareDocument = async () => {
    setLoading(true);

    await updateDocumentAccess({
      roomId,
      email,
      userType: userType as UserType,
      updatedBy: user.info,
    });

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="h-9 flex items-center gap-1 bg-[#00afdb] dark:bg-[#00afdb] dark:text-white font-medium px-4 shadow-lg dark:shadow-lg-dark transition-all duration-300 ease-in-out hover:bg-[#0081a4] dark:hover:bg-[#0081a4]"
          disabled={currentUserType !== "editor"}
        >
          <Share className="min-w-4 md:size-5" />
          <p className="hidden sm:block">Share</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[400px] flex flex-col gap-6 rounded-xl border-none dark:!gradient-darkgray px-5 py-7 shadow-xl sm:min-w-[500px]">
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
                className="h-11 flex-1 border-none bg-[#f5f5f5] dark:bg-[#404040] focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-[#a1a1a1]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <UserTypeSelector userType={userType} setUserType={setUserType} />
            </div>

            <Button
              type="submit"
              onClick={handleShareDocument}
              className="h-11 px-5 bg-[#00afdb] dark:bg-[#00afdb] transition-all duration-300 ease-in-out hover:bg-[#0081a4] dark:hover:bg-[#0081a4] shadow-lg dark:shadow-lg-dark "
              disabled={loading}
            >
              {loading ? "sending..." : "Invite"}
            </Button>
          </div>
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
