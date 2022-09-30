import { ReactNode } from "react";
import { OptionsProvider } from "./Options";
import { CssVarsProvider } from "@mui/joy/styles";

export const AllProviders = ({ children }: { children: ReactNode }) => (
  <CssVarsProvider>
    <OptionsProvider>{children}</OptionsProvider>
  </CssVarsProvider>
);
