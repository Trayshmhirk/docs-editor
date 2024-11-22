import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const Document = () => {
   return (
      <div>
         <Header>
            <div className="flex w-fit items-center gap-2">
               <p className="document-title">This is a the doc title</p>
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
   );
};

export default Document;
