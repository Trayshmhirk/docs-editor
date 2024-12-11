"use client";

import { Plus } from "lucide-react";
import { Button } from "../button";
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
      className="flex gap-2 shadow-lg dark:shadow-lg-dark bg-[#00afdb] dark:bg-[#00afdb] transition-all duration-300 ease-in-out hover:bg-[#0081a4] dark:hover:bg-[#0081a4]"
    >
      <Plus className="w-6 h-6 text-white" />
      <p className="hidden sm:block text-white">Start a blank document</p>
    </Button>
  );
};

export default AddDocumentBtn;
