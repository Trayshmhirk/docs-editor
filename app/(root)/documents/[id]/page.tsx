import DocumentClient from "@/components/DocumentClient";
import { getDocument } from "@/lib/actions/room.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({ params: { id } }: SearchParamProps) => {
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

   return <DocumentClient roomId={id} roomMetadata={room} />;
};

export default Document;
