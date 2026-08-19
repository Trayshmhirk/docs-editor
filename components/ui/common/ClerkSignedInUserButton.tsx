"use client";

import { Show, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

const ClerkSignedInUserButton = () => {
  const { resolvedTheme } = useTheme();

  return (
    <Show when="signed-in">
      <UserButton
        appearance={{
          theme: resolvedTheme === "dark" ? dark : undefined,
          elements: {
            userButtonPopoverMain: "dark:bg-[#1f1f1f] shadow-sm dark:shadow-md-dark",
            userButtonPopoverFooter: "dark:bg-[#0f0f0f]",
          },
        }}
      />
    </Show>
  );
};

export default ClerkSignedInUserButton;
