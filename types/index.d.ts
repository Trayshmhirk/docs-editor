declare type UserType = "creator" | "editor" | "viewer";

declare type Editorprops = {
   roomId: string;
   currentUserType: UserType;
};
