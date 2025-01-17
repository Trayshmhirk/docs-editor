import AddDocumentBtn from "@/components/ui/common/AddDocumentBtn";
import Header from "@/components/ui/shared/Header";
import { getDocuments } from "@/lib/actions/room.actions";
import { dateConverter } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { RoomData } from "@liveblocks/node";
import DeleteModal from "@/components/modal/DeleteModal";
import Notifications from "@/components/ui/liveblocks/Notifications";
import { ToggleTheme } from "@/components/ui/common/ToggleTheme";
import ClerkSignedInUserButton from "@/components/ui/common/ClerkSignedInUserButton";

type RoomDocumentsProps = {
  data: RoomData[];
};

const Home = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const roomDocuments: RoomDocumentsProps = await getDocuments(
    clerkUser.emailAddresses[0].emailAddress
  );

  return (
    <main className="relative flex w-full h-screen flex-col items-center gap-5 sm:gap-10">
      <Header className="sticky left-0 top-0">
        <div className="flex items-center gap-2 lg-gap-6">
          <Notifications />

          <ClerkSignedInUserButton />
        </div>
      </Header>

      <div className="absolute bottom-10 right-7 md:bottom-10 md:right-10">
        <ToggleTheme />
      </div>

      {roomDocuments.data.length > 0 ? (
        <div className="w-full flex justify-center px-4 sm:px-5 py-2 pb-10">
          <div className="max-w-[730px] w-full flex flex-col items-center gap-8 sm:gap-10">
            <div className="items-center flex w-full justify-between">
              <h3 className="text-28text-[28px] font-semibold">
                All documents
              </h3>
              <AddDocumentBtn
                userId={clerkUser.id}
                email={clerkUser.emailAddresses[0].emailAddress}
              />
            </div>

            <ul className="flex w-full flex-col gap-4 sm:gap-5">
              {roomDocuments.data.map(({ id, metadata, createdAt }) => (
                <li
                  key={id}
                  className="flex items-center justify-between gap-4 rounded-lg bg-white dark:bg-[#2A2A2A] px-5 py-4 border border-[#f1f1f1] dark:border-[#424242] shadow-md dark:shadow-lg-dark"
                >
                  <Link
                    href={`/documents/${id}`}
                    className="flex flex-1 items-center gap-3 sm:gap-4"
                  >
                    <div className="size-11 sm:size-14 flex-shrink-0 flex-grow-0 rounded-md bg-[#f5f5f5] dark:bg-[#555555] p-2">
                      <Image
                        src="/assets/icons/doc.svg"
                        alt="Document File"
                        width={40}
                        height={40}
                        className=""
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="line-clamp-1 sm:text-lg font-medium sm:font-normal">
                        {metadata.title}
                      </p>
                      <p className="text-xs sm:text-sm font-light text-[#999999] dark:text-[#B8B8B8]">
                        Created about{" "}
                        {dateConverter(new Date(createdAt).toISOString())}
                      </p>
                    </div>
                  </Link>

                  <DeleteModal roomId={id} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex w-full max-w-[730px] flex-col items-center justify-center gap-5 rounded-lg bg-white dark:bg-[#2A2A2A] px-10 py-6 border border-[#f1f1f1] dark:border-[#424242] shadow-md dark:shadow-lg-dark">
          <div className="rounded-md bg-[#f5f5f5] dark:bg-[#555555] p-2">
            <Image
              src="/assets/icons/doc.svg"
              alt="Document"
              width={40}
              height={40}
              className=""
            />
          </div>

          <AddDocumentBtn
            userId={clerkUser.id}
            email={clerkUser.emailAddresses[0].emailAddress}
          />
        </div>
      )}
    </main>
  );
};

export default Home;
