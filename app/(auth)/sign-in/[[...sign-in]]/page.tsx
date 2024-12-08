"use client";

import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  const { resolvedTheme } = useTheme();

  return (
    <main className="flex h-screen w-full flex-col items-center justify-center gap-10">
      <SignIn
        appearance={{
          baseTheme: resolvedTheme === "dark" ? dark : undefined,
          elements: {
            cardBox:
              "border border-[#eeeeee] dark:border-[#181818] shadow-xl dark:shadow-xl-dark",
            card: "dark:bg-[#1f1f1f] shadow-sm dark:shadow-md-dark",
            footer: "dark:bg-[#0f0f0f]",
            socialButtonsBlockButton:
              "hover:shadow-md dark:hover:shadow-sm-dark duration-300",
          },
        }}
      />
    </main>
  );
};

export default SignInPage;
