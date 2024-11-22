import Image from "next/image";
import Link from "next/link";

const Header = ({ children }: HeaderProps) => {
   return (
      <div className="header flex justify-between gap-2">
         <Link href="/" className="">
            <Image
               src="/assets/logo.png"
               alt="Logo"
               width={35}
               height={32}
               className="hidden md:block"
            />
            <Image
               src="/assets/logo.png"
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
