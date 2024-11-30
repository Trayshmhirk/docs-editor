"use client";

import React, { useState } from "react";

import {
   Dialog,
   DialogClose,
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
            <Button className="min-w-9 rounded-md bg-transparent p-2 transition-all">
               <Trash2 className="size-5 text-red-500" />
            </Button>
         </DialogTrigger>
         <DialogContent className="w-full max-w-[400px] flex flex-col gap-6 rounded-xl border-none bg-[#151E2F] !gradient-darkblue px-5 py-7 shadow-xl sm:min-w-[500px]">
            <DialogHeader>
               <Image
                  src="/assets/icons/delete-modal.svg"
                  alt="delete"
                  width={48}
                  height={48}
                  className="mb-4"
               />
               <DialogTitle>Delete document</DialogTitle>
               <DialogDescription>
                  Are you sure you want to delete this document? this action
                  cant be undone
               </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-5">
               <DialogClose asChild className="w-full bg-dark-400 text-white">
                  Cancel
               </DialogClose>

               <Button
                  variant="destructive"
                  onClick={handleDeleteDocument}
                  className="gradient-red w-full"
               >
                  {loading ? "Deleting..." : "Delete"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
};

export default DeleteModal;
