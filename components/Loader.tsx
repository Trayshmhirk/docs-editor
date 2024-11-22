import React from "react";
import { ClipLoader } from "react-spinners";

const Loader = () => {
   return (
      <div className="flex size-full h-screen items-center justify-center gap-3 text-white">
         <ClipLoader color="#fff" size={40} />
      </div>
   );
};

export default Loader;
