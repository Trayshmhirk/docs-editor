import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const Header = ({ children, className }: HeaderProps) => {
  return (
    <header
      className={cn(
        "border-border bg-surface sticky top-0 z-40 flex min-h-16 w-full items-center justify-between gap-4 border-b px-4 py-2.5 transition-colors sm:px-6",
        className,
      )}
    >
      <Link
        href="/"
        className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-90"
      >
        <Image src="/assets/images/logo.png" alt="Logo" width={32} height={32} />
        <span className="text-foreground hidden font-bold tracking-tight sm:inline-block">
          Docs Editor
        </span>
      </Link>
      {children}
    </header>
  );
};

export default Header;
