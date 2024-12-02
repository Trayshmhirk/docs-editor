"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { createDoc } from "@/lib/actions/room.actions";
import { useRouter } from "next/navigation";

const AddDocumentBtn = ({ userId, email }: AddDocumentBtnProps) => {
  const router = useRouter();
  const addDocumentHandler = async () => {
    try {
      const room = await createDoc({ userId, email });
      console.log(room);

      if (room) {
        router.push(`/documents/${room.id}`);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Button
      type="submit"
      onClick={addDocumentHandler}
      className="gradient-blue flex gap-2 shadow-md"
    >
      <Plus className="w-6 h-6" />
      <p className="hidden sm:block">Start a blank document</p>
    </Button>
  );
};

export default AddDocumentBtn;
