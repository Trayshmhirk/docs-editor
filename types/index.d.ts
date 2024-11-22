declare type UserType = "creator" | "editor" | "viewer";

declare type Editorprops = {
   roomId: string;
   currentUserType: UserType;
};

declare type HeaderProps = {
   children: React.ReactNode;
   className?: string;
};

declare type CreateDocumentParams = {
   userId: string;
   email: string;
};

declare type AccessType = ["room:write"] | ["room:read", "room:presence:write"];

declare type RoomAccesses = Record<string, AccessType>;

declare type RoomMetadata = {
   creatorId: string;
   email: string;
   title: string;
};

declare type AddDocumentBtnProps = {
   userId: string;
   email: string;
};
