import { useState } from "react";
import { SetupView } from "./views/Setup";

import { connect, onFirstState, onJoin, onLeave } from "../connection";
import { GameView } from "./views/Game";
import { LoadingView } from "./views/Connecting";
import { useSignal } from "./hooks/use-signal";

export const App = () => {
  const [state, setState] = useState("setup");
  const [loadingMessage, setLoadingMessage] = useState("Connecting");

  useSignal(onJoin, (room) => {
    setLoadingMessage("Downloading Map");
    setState("loading");
  });
  useSignal(onFirstState, (state) => setState("game"));
  useSignal(onLeave, (code) => setState("setup"));

  switch (state) {
    case "setup":
      return (
        <SetupView
          onSubmit={async ({ webln, address }) => {
            setLoadingMessage("Connecting");
            setState("loading");
            await connect({ address, webln: !!webln });
          }}
        />
      );
    case "loading":
      return <LoadingView title={loadingMessage} />;
    case "game":
      return <GameView />;
    default:
      return null;
  }
};
