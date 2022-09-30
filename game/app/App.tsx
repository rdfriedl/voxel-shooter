import { OptionsProvider } from "./providers/Options";
import { CssVarsProvider } from "@mui/joy/styles";
import { SetupView } from "./views/Setup";
import { GameView } from "./views/Game";

export const App = () => {
  return (
    <CssVarsProvider>
      <OptionsProvider>
        <SetupView />
      </OptionsProvider>
    </CssVarsProvider>
  );
};
