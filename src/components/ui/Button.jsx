import React from "react";

export default function Button({ className="", variant="primary", ...props }) {
  const base = "inline-flex items-center justify-center rounded-full px-4.5 py-2.5 text-[13px] font-semibold transition duration-200 active:scale-[0.99]";
  const styles = {
    primary: "border border-[#16a34a] bg-[#16a34a] text-white shadow-[0_16px_34px_rgba(22,163,74,0.18)] hover:bg-[#15803d]",
    soft: "border border-[rgba(22,163,74,0.12)] bg-green-50 text-[#15803d] hover:bg-white hover:text-[#16a34a]",
    ghost: "text-[#15803d] hover:bg-green-50",
    danger: "bg-rose-600 text-white hover:bg-rose-500",
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
