import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import path from "path";
import express from "express";

// import { uWebSocketsTransport} from "@colyseus/uwebsockets-transport";

import { MyRoom } from "./rooms/my-room";

export default Arena({
  getId: () => "Voxel Shooter",

  // initializeTransport: (options) => new uWebSocketsTransport(options),

  initializeGameServer: (gameServer) => {
    gameServer.define("my_room", MyRoom);

    // gameServer.define("lobby", LobbyRoom);

    // // Define "relay" room
    // gameServer.define("relay", RelayRoom, { maxClients: 4 }).enableRealtimeListing();

    // // Define "chat" room
    // gameServer.define("chat", ChatRoom).enableRealtimeListing();

    // // Register ChatRoom with initial options, as "chat_with_options"
    // // onInit(options) will receive client join options + options registered here.
    // gameServer.define("chat_with_options", ChatRoom, {
    //   custom_options: "you can use me on Room#onCreate",
    // });

    // // Define "state_handler" room
    // gameServer.define("state_handler", StateHandlerRoom).enableRealtimeListing();

    // // Define "auth" room
    // gameServer.define("auth", AuthRoom).enableRealtimeListing();

    // // Define "reconnection" room
    // gameServer.define("reconnection", ReconnectionRoom).enableRealtimeListing();

    // // Define "custom_lobby" room
    // gameServer.define("custom_lobby", CustomLobbyRoom);

    gameServer.onShutdown(function () {
      console.log(`game server is going down.`);
    });
  },

  initializeExpress: (app) => {
    app.use("/", express.static(path.join(__dirname, "../game")));

    // attach web monitoring panel
    app.use("/colyseus", monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
