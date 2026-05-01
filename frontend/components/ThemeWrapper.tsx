"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useSelector((state: RootState) => state.theme.mode);

  return <div className={theme === "dark" ? "dark" : ""}>{children}</div>;
}
