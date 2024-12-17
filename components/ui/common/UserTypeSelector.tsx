import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UserTypeSelector = ({
  userType,
  setUserType,
  onClickHandler,
}: UserTypeSelectorParams) => {
  const accessChangeHandler = (type: UserType) => {
    setUserType(type);

    if (onClickHandler) {
      onClickHandler(type);
    }
  };

  return (
    <Select
      value={userType}
      onValueChange={(type: UserType) => accessChangeHandler(type)}
    >
      <SelectTrigger className="w-fit border-none bg-transparent dark:bg-transparent text-[#828282] dark:text-[#d3d3d3] focus:ring-0 focus:ring-offset-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border border-[#d8d8d8] dark:border-[#7a7a7a] dark:bg-[#111111]">
        <SelectItem
          value="viewer"
          className="cursor-pointer dark:bg-[#111111] dark:text-[#b8b8b8] focus:bg-[#e9e9e9] dark:focus:bg-[#2d2d2d] dark:hover:bg-[#2d2d2d] dark:focus:text-[#efefef]"
        >
          Can view
        </SelectItem>
        <SelectItem
          value="editor"
          className="cursor-pointer dark:bg-[#111111] text-[#b8b8b8] focus:bg-[#e9e9e9] dark:focus:bg-[#2d2d2d] dark:hover:bg-[#2d2d2d] dark:focus:text-[#efefef]"
        >
          Can edit
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default UserTypeSelector;
