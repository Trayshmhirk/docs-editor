import { useTheme } from "next-themes";
import React from "react";
import { ClipLoader } from "react-spinners";

const Loader = () => {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";
  return (
    <div className="flex size-full h-screen items-center justify-center gap-3">
      {isDark ? (
        <ClipLoader color="#ffffff" size={40} className="" />
      ) : (
        <ClipLoader color="#1e1e1e" size={40} className="" />
      )}
    </div>
  );
};

export default Loader;
