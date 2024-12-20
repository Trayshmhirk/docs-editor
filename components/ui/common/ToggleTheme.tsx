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
          className={`text-[#1e1e1e] dark:text-white hover:bg-[#fcfcfc] dark:hover:bg-[#383838] transition-all   ${
            isEditor
              ? "bg-transparent dark:bg-transparent hover-shadow"
              : "bg-white dark:bg-[#2a2a2a] border border-[#d1d1d1] dark:border-[#7a7a7a]"
          }`}
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={`${isEditor ? "dark:bg-black" : "dark:bg-[#2a2a2a]"}  dark:border-[#555555]`}
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
