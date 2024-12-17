import Image from "next/image";
import React, { useState } from "react";
import UserTypeSelector from "../ui/common/UserTypeSelector";
import { Button } from "../ui/button";
import {
  removeCollaborator,
  updateDocumentAccess,
} from "@/lib/actions/room.actions";

const Collaborator = ({
  roomId,
  email,
  creatorId,
  collaborator,
  user,
}: CollaboratorProps) => {
  const [userType, setUserType] = useState(collaborator.userType || "viewer");
  const [loading, setLoading] = useState(false);

  const shareDocumentHandler = async (type: string) => {
    setLoading(true);

    await updateDocumentAccess({
      roomId,
      email,
      userType: type as UserType,
      updatedBy: user,
    });

    setLoading(false);
  };
  const removeDocumentHandler = async (email: string) => {
    setLoading(true);

    await removeCollaborator({
      roomId,
      email,
    });

    setLoading(false);
  };

  return (
    <li className="flex items-center justify-between gap-2 py-3">
      <div className="flex gap-2">
        <Image
          src={collaborator.avatar}
          alt={collaborator.name}
          width={36}
          height={36}
          className="size-9 rounded-full"
        />

        <div>
          <p className="flex gap-2 line-clamp-1 text-sm font-semibold leading-4 text-[#555555] dark:text-[#efefef]">
            {collaborator.name}
            <span className="text-[10px] font-normal text-text-[#efefef]">
              {loading && "updating..."}
            </span>
          </p>
          <p className="text-sm font-light text-text-[#efefef]">
            {collaborator.email}
          </p>
        </div>
      </div>

      {creatorId === collaborator.id ? (
        <p className="text-sm dark:text-[#efefef]">Owner</p>
      ) : (
        <div className="flex items-center gap-1">
          <UserTypeSelector
            userType={userType}
            setUserType={setUserType || "viewer"}
            onClickHandler={shareDocumentHandler}
          />
          <Button
            type="button"
            className="gradient-red"
            onClick={() => removeDocumentHandler(collaborator.email)}
          >
            Remove
          </Button>
        </div>
      )}
    </li>
  );
};

export default Collaborator;
