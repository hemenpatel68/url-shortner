import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { toggleMode } from "@/store/themeSlice";

export function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme.mode);

  return {
    theme,
    toggle: () => dispatch(toggleMode()),
  };
}
