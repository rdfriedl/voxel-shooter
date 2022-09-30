import { useEffect, useRef } from "react";
import { getSystemErrorName } from "util";
import { Game } from "../../game";

export const GameView = () => {
  useEffect(() => {
    const container = document.getElementById("game");
    const game = new Game();

    container?.appendChild(game.domElement);
    game.play();

    return () => game.stop();
  }, []);

  return <div id="game" />;
};
