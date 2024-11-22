import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const Header = ({ children, className }: HeaderProps) => {
   return (
      <div
         className={cn(
            "min-h-16 min-w-full flex-nowrap bg-dark-100 flex w-full items-center justify-between gap-2 px-4",
            className
         )}
      >
         <Link href="/" className="">
            <Image
               src="/assets/images/logo.png"
               alt="Logo"
               width={32}
               height={32}
               className="hidden md:block"
            />
            <Image
               src="/assets/images/logo.png"
               alt="Logo"
               width={32}
               height={32}
               className="block md:hidden"
            />
         </Link>
         {children}
      </div>
   );
};

export default Header;
