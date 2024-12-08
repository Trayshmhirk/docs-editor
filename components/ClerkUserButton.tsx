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
          elements: {
            userButtonPopoverMain:
              "dark:bg-[#1f1f1f] shadow-sm dark:shadow-md-dark",
            userButtonPopoverFooter: "dark:bg-[#0f0f0f]",
            modalContent: "dark:bg-[]",
          },
        }}
      />
    </SignedIn>
  );
};

export default ClerkUserButton;
