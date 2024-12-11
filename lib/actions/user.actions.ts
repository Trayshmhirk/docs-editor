"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { liveblocks } from "../liveblocks";

export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  const client = clerkClient();
  try {
    const { data } = await (
      await client
    ).users.getUserList({
      emailAddress: userIds,
    });

    const users = data.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      avatar: user.imageUrl,
    }));

    const sortedUsers = userIds.map((email) =>
      users.find((user) => user.email === email)
    );

    return JSON.parse(JSON.stringify(sortedUsers));
  } catch (error) {
    console.log(`Error fetching users: ${error}`);
  }
};

export const getDocumentUsers = async ({
  roomId,
  currentUser,
  text,
}: {
  roomId: string;
  currentUser: string;
  text: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    const users = Object.keys(room.usersAccesses).filter(
      (email) => email !== currentUser
    );

    if (text.length) {
      const lowerCaseText = text.toLowerCase();

      const filteredUsers = users.filter((email) =>
        email.toLocaleLowerCase().includes(lowerCaseText)
      );

      return JSON.parse(JSON.stringify(filteredUsers));
    }

    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    console.log(`Error fetching document users: ${error}`);
  }
};
