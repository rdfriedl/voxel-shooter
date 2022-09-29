import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import path from "path";
import express from "express";

// import { uWebSocketsTransport} from "@colyseus/uwebsockets-transport";

import { GameRoom } from "./rooms/game-room";

export default Arena({
  getId: () => "Voxel Shooter",

  // initializeTransport: (options) => new uWebSocketsTransport(options),

  initializeGameServer: (gameServer) => {
    gameServer.define("game-room", GameRoom);

    gameServer.onShutdown(function () {
      console.log(`game server is going down.`);
    });
  },

  initializeExpress: (app) => {
    app.use("/", express.static(path.join(__dirname, "../game")));

    // attach web monitoring panel
    app.use("/colyseus", monitor());
  },
});
