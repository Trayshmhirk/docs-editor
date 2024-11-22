declare type UserType = "creator" | "editor" | "viewer";

declare type Editorprops = {
   roomId: string;
   currentUserType: UserType;
};

declare type HeaderProps = {
   children: React.ReactNode;
   className?: string;
};
