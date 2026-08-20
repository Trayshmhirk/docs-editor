"use client";

import * as React from "react";
import { Moon, Sun, Check } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ToggleTheme({ isEditor }: { isEditor?: boolean }) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          className={`text-[#1e1e1e] transition-all hover:bg-[#fcfcfc] dark:text-white dark:hover:bg-[#383838] ${
            isEditor
              ? "hover-shadow bg-transparent dark:bg-transparent"
              : "border border-[#d1d1d1] bg-white dark:border-[#7a7a7a] dark:bg-[#2a2a2a]"
          }`}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`${isEditor ? "dark:bg-black" : "dark:bg-[#2a2a2a]"} dark:border-[#555555]`}
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="focus:bg-[#e9e9e9] dark:focus:bg-[#3e3e3e]"
        >
          Light
          {resolvedTheme === "light" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="focus:bg-[#e9e9e9] dark:focus:bg-[#3e3e3e]"
        >
          Dark
          {resolvedTheme === "dark" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="focus:bg-[#e9e9e9] dark:focus:bg-[#3e3e3e]"
        >
          System
          {theme === "system" && <Check className="ml-auto h-4 w-4" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
