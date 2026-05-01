import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem("theme");
  if (saved) return saved as "light" | "dark";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const initialState = {
  mode: getInitialTheme(),
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", state.mode);
      }
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
    },
  },
});

export const { toggleMode, setTheme } = themeSlice.actions;

export default themeSlice.reducer;
