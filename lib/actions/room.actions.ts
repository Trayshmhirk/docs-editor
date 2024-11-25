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
   }
};

export const updateDocument = async (roomId: string, title: string) => {
   try {
      const updatedRoom = await liveblocks.updateRoom(roomId, {
         metadata: { title: title },
      });

      revalidatePath(`/documents/${roomId}`);

      return JSON.parse(JSON.stringify(updatedRoom));
   } catch (error) {
      console.log(`Error updating document room: ${error}`);
   }
};

export const getDocuments = async (email: string) => {
   try {
      const rooms = await liveblocks.getRooms({ userId: email });
      return JSON.parse(JSON.stringify(rooms));
   } catch (error) {
      console.log(`Error getting document rooms: ${error}`);
   }
};
