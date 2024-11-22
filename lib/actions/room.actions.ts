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
         defaultAccesses: [],
      });

      revalidatePath("/");

      return JSON.parse(JSON.stringify(room));
   } catch (error) {
      console.log(`Error creating document room: ${error}`);
   }
};
