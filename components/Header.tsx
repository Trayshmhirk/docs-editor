import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const Header = ({ children, className }: HeaderProps) => {
  return (
    <div
      className={cn(
        "min-h-16 min-w-full flex-nowrap bg-[#F5F5F5] dark:bg-black flex w-full items-center justify-between gap-2 px-4 md:px-6",
        className
      )}
    >
      <Link href="/" className="flex gap-2 items-center">
        <Image
          src="/assets/images/logo.png"
          alt="Logo"
          width={32}
          height={32}
        />
        <span className="hidden md:block font-bold">Docs Editor</span>
      </Link>
      {children}
    </div>
  );
};

export default Header;
