"use client";

import React from "react";
import { usePathname } from "next/navigation";

export const PageTransitionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition flex-1 flex flex-col">
      {children}
    </div>
  );
};
