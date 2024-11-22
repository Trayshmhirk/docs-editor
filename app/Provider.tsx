"use client";
import { LiveblocksProvider } from "@liveblocks/react";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import Loader from "@/components/Loader";

const Provider = ({ children }: { children: React.ReactNode }) => {
   return (
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
         <ClientSideSuspense fallback={<Loader />}>
            {children}
         </ClientSideSuspense>
      </LiveblocksProvider>
   );
};

export default Provider;
