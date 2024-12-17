import { Composer, Thread } from "@liveblocks/react-ui";
import { useThreads } from "@liveblocks/react/suspense";
import React from "react";
import { BaseMetadata, ThreadData } from "@liveblocks/client";
import { useIsThreadActive } from "@liveblocks/react-lexical";
import { cn } from "@/lib/utils";

const ThreadWrapper = ({ thread }: { thread: ThreadData<BaseMetadata> }) => {
  const isActive = useIsThreadActive(thread.id);
  return (
    <Thread
      thread={thread}
      data-state={isActive ? "active" : null}
      className={cn(
        "w-full max-w-[800px] border border-[#cccccc] dark:border-[#444444] shadow-sm lg:w-[350px] transition-all rounded-md overflow-hidden",
        isActive && "!border-blue-500 shadow-md",
        thread.resolved && "opacity-40"
      )}
    />
  );
};

const Comments = () => {
  const { threads } = useThreads();
  return (
    <div className="lg:w-fit flex w-full flex-col gap-4 items-center justify-center">
      <Composer className="w-full max-w-[800px] border border-[#cccccc] dark:border-[#444444] shadow-sm lg:w-[350px] rounded-md" />

      {threads.map((thread) => (
        <ThreadWrapper key={thread.id} thread={thread} />
      ))}
    </div>
  );
};

export default Comments;
