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
import { Button } from "@/components/ui/button";
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
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-surface-hover hover:text-destructive text-muted size-8 rounded-lg transition-colors"
          title="Delete document"
        >
          <Trash2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="flex w-full flex-col gap-6 p-6 sm:max-w-md">
        <DialogHeader className="items-center gap-3 space-y-0 text-center">
          <div className="bg-destructive/15 text-destructive flex size-14 items-center justify-center rounded-full">
            <Trash2 className="size-6" />
          </div>

          <DialogTitle className="text-foreground text-lg font-semibold">
            Delete document
          </DialogTitle>
          <DialogDescription className="text-muted max-w-xs text-xs">
            Are you sure you want to delete this document? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="grid grid-cols-2 gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="w-full text-xs"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteDocument}
            disabled={loading}
            className="w-full text-xs font-medium"
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
