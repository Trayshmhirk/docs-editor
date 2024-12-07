"use client";

import React, { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { deleteDocument } from "@/lib/actions/room.actions";

const DeleteModal = ({ roomId }: { roomId: string }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteDocument = async () => {
    setLoading(true);

    await deleteDocument(roomId);

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="min-w-9 rounded bg-transparent dark:bg-transparent p-2 transition-all hover:bg-[#f9f9f9] dark:hover:bg-[#383838] hover-shadow">
          <Trash2 className="size-5 text-red-600 dark:text-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[400px] flex flex-col gap-6 rounded-xl border-none !gradient-darkgray px-5 py-7 shadow-xl sm:min-w-[500px]">
        <DialogHeader className="items-center sm:text-center gap-4 space-y-0">
          <Image
            src="/assets/icons/delete-modal.svg"
            alt="delete"
            width={48}
            height={48}
            className=""
          />
          <DialogTitle className="text-[#dcdcdc]">Delete document</DialogTitle>
          <DialogDescription className="max-w-[400px] text-[#b0b0b0]">
            Are you sure you want to delete this document? this action cant be
            undone
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDeleteDocument}
            className="w-full bg-[#ef4444]"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
