import { RoomProvider } from "@liveblocks/react";
import { ClientSideSuspense } from "@liveblocks/react/suspense";
import { ClipLoader } from "react-spinners";
import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const CollaborativeRoom = () => {
   return (
      <RoomProvider id="my-room">
         <ClientSideSuspense
            fallback={<ClipLoader color="#36d7b7" size={20} />}
         >
            <div className="flex size-full max-h-screen flex-1 flex-col items-center overflow-hidden">
               <Header>
                  <div className="flex w-fit items-center gap-2">
                     <p className="line-clamp-1 border-dark-400 text-base font-semibold leading-[24px] sm:pl-0 sm:text-xl">
                        This is a the doc title
                     </p>
                  </div>

                  <div className="flex items-center gap-3 justify-center">
                     <p>Share</p>
                     <SignedOut>
                        <SignInButton />
                     </SignedOut>
                     <SignedIn>
                        <UserButton />
                     </SignedIn>
                  </div>
               </Header>
               <Editor />
            </div>
         </ClientSideSuspense>
      </RoomProvider>
   );
};

export default CollaborativeRoom;
