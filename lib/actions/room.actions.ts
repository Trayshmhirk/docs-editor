"use server";

import { nanoid } from "nanoid";
import { liveblocks } from "../liveblocks";
import { revalidatePath } from "next/cache";

export const createDoc = async ({ userId, email }: CreateDocumentParams) => {
   const roomId = nanoid();

   try {
      const metadata: RoomMetadata = {
         creatorId: userId,
         email: email,
         title: "Untitled",
      };

      const userAccesses: RoomAccesses = {
         [email]: ["room:write"],
      };

      const room = await liveblocks.createRoom(roomId, {
         metadata: metadata,
         usersAccesses: userAccesses,
         defaultAccesses: ["room:write"],
      });

      revalidatePath("/");

      return JSON.parse(JSON.stringify(room));
   } catch (error) {
      console.log(`Error creating document room: ${error}`);
   }
};

export const getDocument = async ({
   roomId,
   // userId,
}: {
   roomId: string;
   userId: string;
}) => {
   try {
      const room = await liveblocks.getRoom(roomId);

      // const hasAccess = Object.keys(room.usersAccesses).includes(userId);
      // if (!hasAccess) {
      //    throw new Error("You do not have access to this document");
      // }

      return JSON.parse(JSON.stringify(room));
   } catch (error) {
      console.log(`Error getting document room: ${error}`);
      return null;
   }
};
