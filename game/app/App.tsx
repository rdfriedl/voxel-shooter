import { useState } from "react";
import { SetupView } from "./views/Setup";

import { connect } from "../connection";
import { GameView } from "./views/Game";
import { ConnectingView } from "./views/Connecting";

export const App = () => {
  const [state, setState] = useState("setup");

  switch (state) {
    case "setup":
      return (
        <SetupView
          onSubmit={async ({ webln, address }) => {
            setState("connecting");
            await connect();
            setState("game");
          }}
        />
      );
    case "connecting":
      return <ConnectingView />;
    case "game":
      return <GameView />;
    default:
      return null;
  }
};
