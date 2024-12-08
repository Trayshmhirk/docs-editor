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
            cardBox: "",
            card: "dark:bg-[#1f1f1f]",
            footer: "dark:bg-[#0f0f0f]",
          },
        }}
      />
    </main>
  );
};

export default SignInPage;
