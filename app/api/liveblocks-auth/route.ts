import { liveblocks } from "@/lib/liveblocks";
import { getUserColor } from "@/lib/utils";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const emailClaim = (sessionClaims?.email as string) || (sessionClaims?.primaryEmail as string);
  const nameClaim =
    (sessionClaims?.fullName as string) ||
    (sessionClaims?.name as string) ||
    [sessionClaims?.firstName, sessionClaims?.lastName].filter(Boolean).join(" ");
  const avatarClaim = (sessionClaims?.imageUrl as string) || (sessionClaims?.image as string) || "";

  let userInfo = {
    id: userId,
    name: nameClaim || "Collaborator",
    email: emailClaim || "",
    avatar: avatarClaim,
    color: getUserColor(userId),
  };

  // If email was not present in the default session JWT claims, hydrate via Clerk client
  if (!userInfo.email) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    userInfo = {
      id: userId,
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || "Collaborator",
      email: clerkUser.emailAddresses[0]?.emailAddress ?? userId,
      avatar: clerkUser.imageUrl,
      color: getUserColor(userId),
    };
  }

  // Identify user in Liveblocks session
  const { status, body } = await liveblocks.identifyUser(
    {
      userId: userInfo.email,
      groupIds: [],
    },
    { userInfo },
  );

  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
