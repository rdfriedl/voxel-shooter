import { useEffect, useState } from "react";
import { Game } from "../../game";
import { GameUI } from "../gameUI/GameUI";

export const GameView = () => {
  const [game] = useState(() => new Game());

  useEffect(() => {
    const container = document.getElementById("game");
    container?.appendChild(game.domElement);
    game.play();

    return () => game.stop();
  }, []);

  return (
    <>
      <GameUI game={game} />
      <div id="game" />
    </>
  );
};
