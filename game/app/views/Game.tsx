import { useEffect } from "react";
import { Game } from "../../game";
import { GameUI } from "../components/GameUI";

export const GameView = () => {
  useEffect(() => {
    const container = document.getElementById("game");
    const game = new Game();

    container?.appendChild(game.domElement);
    game.play();

    return () => game.stop();
  }, []);

  return (
    <>
      <GameUI />
      <div id="game" />
    </>
  );
};
