import DocumentClient from "@/components/DocumentClient";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({ params }: { params: { id: string } }) => {
   const { id } = params;

   const clerkUser = await currentUser();
   if (!clerkUser) {
      redirect("/sign-in");
   }

   const room = await getDocument({
      roomId: id,
      userId: clerkUser.emailAddresses[0].emailAddress,
   });

   if (!room) {
      redirect("/");
   }

   // TODO: Access permissions of users to access the document
   const userIds = Object.keys(room.usersAccesses);
   const users = await getClerkUsers({ userIds });

   const usersData = users.map((user: User) => ({
      ...user,
      userType: room.usersAccesses[user.email]?.includes("room:write")
         ? "editor"
         : "viewer",
   }));

   const currentUserType = room.usersAccesses[
      clerkUser.emailAddresses[0].emailAddress
   ]?.includes("room:write")
      ? "editor"
      : "viewer";

   return (
      <DocumentClient
         roomId={id}
         roomMetadata={room.metadata}
         users={usersData}
         currentUserType={currentUserType}
      />
   );
};

export default Document;
