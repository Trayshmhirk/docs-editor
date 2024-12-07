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
      <DialogContent className="w-full max-w-[400px] flex flex-col gap-6 rounded-xl border-none dark:!gradient-darkgray px-5 py-7 shadow-xl sm:min-w-[500px]">
        <DialogHeader className="items-center sm:text-center gap-4 space-y-0">
          <div className="size-12 rounded-full flex items-center justify-center border-8 border-[#c46060] dark:border-[#603333] bg-[#772d2d] dark:bg-[#2c1616]">
            <Trash2 className="size-5 text-[#f84141] dark:text-[#ed4b4b]" />
          </div>

          <DialogTitle className="text-[#666666] dark:text-[#dcdcdc]">
            Delete document
          </DialogTitle>
          <DialogDescription className="max-w-[400px] text-[#888888] dark:text-[#b0b0b0]">
            Are you sure you want to delete this document? this action cant be
            undone
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="destructive"
            onClick={handleDeleteDocument}
            className="w-full bg-[#ef4444] dark:bg-[#f34242] hover:bg-[] dark:hover:bg-[]"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
