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
import { Button } from "./ui/button";
import { Share } from "lucide-react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import UserTypeSelector from "./UserTypeSelector";
import Collaborator from "./Collaborator";
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
         <DialogTrigger>
            <Button
               className="gradient-blue h-9 flex items-center gap-1 px-4"
               disabled={currentUserType !== "editor"}
            >
               <Share className="min-w-4 md:size-5" />
               <p className="hidden sm:block">Share</p>
            </Button>
         </DialogTrigger>
         <DialogContent className="w-full max-w-[400px] flex flex-col gap-6 rounded-xl border-none bg-[#151E2F] !gradient-darkblue px-5 py-7 shadow-xl sm:min-w-[500px]">
            <DialogHeader>
               <DialogTitle>Manage who can view this project</DialogTitle>
               <DialogDescription>
                  Select which users can view and edit this document
               </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3">
               <Label htmlFor="email" className="text-blue-100">
                  Email address
               </Label>
               <div className="flex items-center gap-3">
                  <div className="flex flex-1 items-center rounded-md bg-dark-400">
                     <Input
                        id="email"
                        type="email"
                        placeholder="Enter email address"
                        className="h-11 flex-1 border-none bg-dark-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                     />
                     <UserTypeSelector
                        userType={userType}
                        setUserType={setUserType}
                     />
                  </div>

                  <Button
                     type="submit"
                     onClick={handleShareDocument}
                     className="gradient-blue flex h-full gap-1 px-5"
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
