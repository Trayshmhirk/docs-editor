"use client";

import CollaborativeRoom from "@/components/CollaborativeRoom";
import { RoomData } from "@liveblocks/node";

interface DocumentClientProps {
   roomId: string;
   roomMetadata: RoomData; // Replace with the actual metadata type
}

const DocumentClient: React.FC<DocumentClientProps> = ({
   roomId,
   roomMetadata,
}) => {
   return (
      <main className="flex w-full flex-col items-center">
         <CollaborativeRoom roomId={roomId} roomMetadata={roomMetadata} />
      </main>
   );
};

export default DocumentClient;
