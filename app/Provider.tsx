"use client";
import { LiveblocksProvider } from "@liveblocks/react";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import Loader from "@/components/Loader";
import { getClerkUsers, getDocumentUsers } from "@/lib/actions/user.actions";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const Provider = ({ children }: { children: React.ReactNode }) => {
   const { user: clerkUser } = useUser();
   if (!clerkUser) redirect("/sign-in");

   return (
      <LiveblocksProvider
         authEndpoint="/api/liveblocks-auth"
         resolveUsers={async ({ userIds }) => {
            const users = await getClerkUsers({ userIds });
            return users;
         }}
         resolveMentionSuggestions={async ({ text, roomId }) => {
            const roomUsers = await getDocumentUsers({
               roomId,
               currentUser: clerkUser.emailAddresses[0].emailAddress,
               text,
            });
            return roomUsers;
         }}
      >
         <ClientSideSuspense fallback={<Loader />}>
            {children}
         </ClientSideSuspense>
      </LiveblocksProvider>
   );
};

export default Provider;
