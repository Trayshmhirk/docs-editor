import Image from "next/image";
import React, { useState } from "react";
import UserTypeSelector from "../ui/common/UserTypeSelector";
import { Button } from "../ui/button";
import { removeCollaborator, updateDocumentAccess } from "@/lib/actions/room.actions";
import { BeatLoader } from "react-spinners";

const Collaborator = ({ roomId, email, creatorId, collaborator, user }: CollaboratorProps) => {
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
          <p className="line-clamp-1 flex gap-2 text-sm leading-4 font-semibold text-[#555555] dark:text-[#efefef]">
            {collaborator.name}
            <span className="text-text-[#efefef] text-[10px] font-normal">
              {loading && (
                <>
                  Updating
                  <BeatLoader />
                </>
              )}
            </span>
          </p>
          <p className="text-text-[#efefef] text-sm font-light">{collaborator.email}</p>
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
            className="bg-[#ef4444] transition-all duration-200 ease-in-out hover:bg-[#e52828] dark:bg-[#f87171] dark:text-white dark:hover:bg-[#ef4444]"
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
