import React from "react";
export default function Container({ children, className="" }) {
  return <div className={`mx-auto w-full max-w-[1480px] px-3 md:px-5 ${className}`}>{children}</div>;
}
