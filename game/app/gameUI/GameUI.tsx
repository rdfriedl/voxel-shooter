import { Game } from "../../game";
import { getPlayerState, onPlayerAliveChange, onRespawn } from "../../connection";

import { useForceUpdate } from "../hooks/use-force-update";
import { useSignal } from "../hooks/use-signal";

import { DeathScreen } from "./screens/DeathScreen";
import { GameOverlayScreen } from "./screens/GameOverlayScreen";

export const GameUI = ({ game }: { game: Game }) => {
  const update = useForceUpdate();
  // useSignal(onRespawn, update);
  useSignal(onPlayerAliveChange, update);

  if (getPlayerState()?.alive) {
    return <GameOverlayScreen game={game} />;
  } else {
    return <DeathScreen game={game} />;
  }
};
