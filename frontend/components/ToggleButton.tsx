"use client";

import { RootState } from "@/store/store";
import { toggleMode } from "@/store/themeSlice";
import { Moon, Sun } from "lucide-react";
import * as Toggle from "@radix-ui/react-toggle";
import { useDispatch, useSelector } from "react-redux";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.mode);

  const isDark = theme === "dark";

  return (
    <Toggle.Root
      pressed={isDark}
      onPressedChange={() => dispatch(toggleMode())}
      aria-label="Toggle theme"
      className="flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          Light
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          Dark
        </>
      )}
    </Toggle.Root>
  );
}
