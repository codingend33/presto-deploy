import { useContext } from "react";
import ErrorContext from "./ErrorProvider";

export const useErrorPopup = () => useContext(ErrorContext);
