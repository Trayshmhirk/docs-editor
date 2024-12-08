"use client";

import { SignedIn, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

const ClerkUserButton = () => {
  const { resolvedTheme } = useTheme();

  return (
    <SignedIn>
      <UserButton
        appearance={{
          baseTheme: resolvedTheme === "dark" ? dark : undefined,
        }}
      />
    </SignedIn>
  );
};

export default ClerkUserButton;
