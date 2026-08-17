import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const Header = ({ children, className }: HeaderProps) => {
  return (
    <header
      className={cn(
        "flex min-h-16 w-full min-w-full flex-nowrap items-center justify-between gap-2 bg-[#F5F5F5] px-4 dark:bg-black md:px-6",
        className,
      )}
    >
      <Link href="/" className="flex items-center gap-2">
        <Image src="/assets/images/logo.png" alt="Logo" width={32} height={32} />
        <span className="hidden font-bold md:block">Docs Editor</span>
      </Link>
      {children}
    </header>
  );
};

export default Header;
