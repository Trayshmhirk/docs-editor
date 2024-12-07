import AddDocumentBtn from "@/components/AddDocumentBtn";
import Header from "@/components/Header";
import { getDocuments } from "@/lib/actions/room.actions";
import { dateConverter } from "@/lib/utils";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { RoomData } from "@liveblocks/node";
import DeleteModal from "@/components/DeleteModal";
import Notifications from "@/components/Notifications";
import { ToggleTheme } from "@/components/ToggleTheme";

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

          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Header>

      <div className="absolute bottom-10 right-10">
        <ToggleTheme />
      </div>

      {roomDocuments.data.length > 0 ? (
        <div className="flex flex-col items-center mb-10 w-full gap-10 px-5">
          <div className="max-w-[730px] items-end flex w-full justify-between">
            <h3 className="text-28text-[28px] font-semibold">All documents</h3>
            <AddDocumentBtn
              userId={clerkUser.id}
              email={clerkUser.emailAddresses[0].emailAddress}
            />
          </div>

          <ul className="flex w-full max-w-[730px] flex-col gap-5">
            {roomDocuments.data.map(({ id, metadata, createdAt }) => (
              <li
                key={id}
                className="flex items-center justify-between gap-4 rounded-lg bg-[#2A2A2A] bg-cover p-5 shadow-xl"
              >
                <Link
                  href={`/documents/${id}`}
                  className="flex flex-1 items-center gap-4"
                >
                  <div className="hidden rounded-md bg-[#555555] p-2 sm:block">
                    <Image
                      src="/assets/icons/doc.svg"
                      alt="Document File"
                      width={40}
                      height={40}
                      className=""
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="line-clamp-1 text-lg">{metadata.title}</p>
                    <p className="text-sm font-light text-[#B8B8B8]">
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
      ) : (
        <div className="flex w-full max-w-[730px] flex-col items-center justify-center gap-5 rounded-lg bg-dark-200 px-10 py-8">
          <Image
            src="/assets/icons/doc.svg"
            alt="Document"
            width={40}
            height={40}
            className=""
          />

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
