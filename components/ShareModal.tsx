"use client";

// import { useSelf } from "@liveblocks/react/suspense";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Share } from "lucide-react";

const ShareModal = ({
  // roomId,
  // collaborators,
  // creatorId,
  currentUserType,
}: ShareDocumentDialogProps) => {
  // const user = useSelf();

  const [open, setOpen] = useState(false);
  // const [loading, setLoading] = useState(false);
  // const [email, setEmail] = useState("");
  // const [userType, setUserType] = useState<UserType>("viewer");

  // const handleShareDocument = async () => {};

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          className="gradient-blue h-9 flex items-center gap-1 px-4"
          disabled={currentUserType !== "editor"}
        >
          <Share className="min-w-4 md:size-5" />
          <p className="hidden sm:block">Share</p>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
