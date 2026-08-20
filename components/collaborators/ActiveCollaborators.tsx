import { useOthers } from "@liveblocks/react/suspense";
import Image from "next/image";

const ActiveCollaborators = () => {
  const others = useOthers();
  const collaborators = others.map((other) => other.info);

  if (!collaborators.length) return null;

  return (
    <ul
      className="hidden items-center justify-end -space-x-2 overflow-hidden sm:flex"
      title={`${collaborators.length} active collaborator${collaborators.length > 1 ? "s" : ""}`}
    >
      {collaborators.map(({ id, avatar, name, color }) => (
        <li
          key={id}
          className="relative transition-transform duration-200 hover:z-10 hover:scale-110"
        >
          <Image
            src={avatar}
            alt={name}
            title={name}
            width={100}
            height={100}
            className="inline-block size-8 rounded-full ring-2 ring-white dark:ring-[#111111]"
            style={{ border: `2px solid ${color}` }}
          />
        </li>
      ))}
    </ul>
  );
};

export default ActiveCollaborators;
