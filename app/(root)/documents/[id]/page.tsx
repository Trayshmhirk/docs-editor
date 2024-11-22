import { Editor } from "@/components/editor/Editor";
import Header from "@/components/Header";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const Document = () => {
   return (
      <div>
         <Header>
            <div className="flex w-fit items-center gap-2">
               <p className="document-title">This is a fake doc</p>
            </div>

            <SignedOut>
               <SignInButton />
            </SignedOut>
            <SignedIn>
               <UserButton />
            </SignedIn>
         </Header>
         <Editor />
      </div>
   );
};

export default Document;
