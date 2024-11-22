"use client";

import CollaborativeRoom from "@/components/CollaborativeRoom";

interface DocumentClientProps {
   roomId: string;
   roomMetadata: RoomMetadata; // Replace with the actual metadata type
}

const DocumentClient: React.FC<DocumentClientProps> = ({
   roomId,
   roomMetadata,
}) => {
   return (
      <main className="flex w-full flex-col items-center">
         <CollaborativeRoom
            roomId={roomId}
            roomMetadata={roomMetadata}
            users={[]}
            currentUserType="editor"
         />
      </main>
   );
};

export default DocumentClient;
