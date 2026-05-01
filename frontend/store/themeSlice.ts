import { createSlice } from "@reduxjs/toolkit";

type State = {
  mode: "light" | "dark";
};

const initialState: State = {
  mode: "light",
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
